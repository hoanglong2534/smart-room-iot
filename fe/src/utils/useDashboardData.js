import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { getSensorData, getDevices } from '../services/api';

const HARDWARE_STALE_MS = 10000;

const resolveStompBrokerUrl = () => {
    if (process.env.REACT_APP_STOMP_URL) return process.env.REACT_APP_STOMP_URL;
    try {
        const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:12345/smartroom/api';
        const u = new URL(apiBase);
        const wsScheme = u.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${wsScheme}//${u.host}/smartroom/ws`;
    } catch {
        return 'ws://localhost:12345/smartroom/ws';
    }
};

const parseDeviceId = (raw) => {
    if (raw == null) return null;
    const n = Number(typeof raw === 'string' ? raw.trim() : raw);
    return Number.isFinite(n) ? n : null;
};

const maxSensorTimeMs = (records) => {
    if (!records?.length) return 0;
    let max = 0;
    for (const r of records) {
        const raw = r.from ?? r.time;
        if (!raw) continue;
        const ms = new Date(raw).getTime();
        if (Number.isFinite(ms) && ms > max) max = ms;
    }
    return max;
};

export const useDashboardData = (applyRecords) => {
    const [devices, setDevices] = useState({
        humidifier: { isOn: false, id: null, isInit: false },
        light: { isOn: false, id: null, isInit: false },
        fan: { isOn: false, id: null, isInit: false }
    });

    const [loadingDevices, setLoadingDevices] = useState({
        humidifier: false,
        light: false,
        fan: false
    });

    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [snapshot, setSnapshot] = useState({ humidity: null, light: null, temperature: null, time: null });
    const [seriesData, setSeriesData] = useState({ humidity: [], light: [], temperature: [] });
    const [isHardwareOnline, setIsHardwareOnline] = useState(true);

    const mountedAtRef = useRef(Date.now());
    const trackedMaxSensorMsRef = useRef(null);
    const lastEvidenceMsRef = useRef(0);

    const stompRef = useRef(null);
    const initialFetchDoneRef = useRef(false);

    const markHardwareAlive = useCallback(() => {
        lastEvidenceMsRef.current = Date.now();
        setIsHardwareOnline(true);
    }, []);

    const ingestSensorRecords = useCallback(
        (records) => {
            if (!records?.length) return;
            const m = maxSensorTimeMs(records);
            if (!m) return;

            if (trackedMaxSensorMsRef.current === null) {
                trackedMaxSensorMsRef.current = m;
                if (Date.now() - m < HARDWARE_STALE_MS) {
                    markHardwareAlive();
                }
                return;
            }
            if (m > trackedMaxSensorMsRef.current) {
                trackedMaxSensorMsRef.current = m;
                markHardwareAlive();
            }
        },
        [markHardwareAlive]
    );

    const recomputeOnline = useCallback(() => {
        const now = Date.now();
        const lastEv = lastEvidenceMsRef.current;
        if (lastEv > 0 && now - lastEv <= HARDWARE_STALE_MS) {
            setIsHardwareOnline(true);
            return;
        }
        if (lastEv === 0) {
            if (now - mountedAtRef.current > HARDWARE_STALE_MS) {
                setIsHardwareOnline(false);
            }
            return;
        }
        setIsHardwareOnline(false);
    }, []);

    const fetchLatestData = useCallback(async () => {
        try {
            const response = await getSensorData({ page: 0, size: 30, sortType: 'desc' });
            const records = response?.content || [];
            ingestSensorRecords(records);
            applyRecords(records, setSeriesData, setSnapshot, setLoadingDevices);
        } catch (error) {
            console.error('Error fetching latest sensor data:', error);
        }
    }, [applyRecords, ingestSensorRecords]);

    const fetchLatestDevices = useCallback(async () => {
        try {
            const response = await getDevices();
            const devicesData = response?.content || response || [];
            if (Array.isArray(devicesData)) {
                setDevices((prev) => {
                    const next = { ...prev };
                    devicesData.forEach((serverDevice) => {
                        const nameLower = (serverDevice.name || '').toLowerCase();
                        let key = null;
                        if (nameLower.includes('hút ẩm') || nameLower.includes('humidifier')) key = 'humidifier';
                        if (nameLower.includes('đèn') || nameLower.includes('light')) key = 'light';
                        if (nameLower.includes('quạt') || nameLower.includes('fan')) key = 'fan';

                        if (key) {
                            const newIsOn = serverDevice.currentStatus === 'ON' || serverDevice.currentStatus === '1';
                            if (prev[key] && prev[key].isOn !== newIsOn) {
                                setLoadingDevices((loadStates) => ({ ...loadStates, [key]: false }));
                            }
                            next[key] = { isOn: newIsOn, id: serverDevice.id, isInit: true };
                        }
                    });
                    return next;
                });
            }
        } catch (error) {
            console.error('Error fetching devices', error);
        }
    }, []);

    useEffect(() => {
        if (initialFetchDoneRef.current) return;
        initialFetchDoneRef.current = true;
        mountedAtRef.current = Date.now();
        trackedMaxSensorMsRef.current = null;
        lastEvidenceMsRef.current = 0;
        fetchLatestData();
        fetchLatestDevices();
    }, [fetchLatestData, fetchLatestDevices]);

    useEffect(() => {
        const brokerUrl = resolveStompBrokerUrl();
        const client = new Client({
            brokerURL: brokerUrl,
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                setIsSocketConnected(true);
                client.subscribe('/topic/sensors', (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        const records = Array.isArray(data) ? data : [data];
                        ingestSensorRecords(records);
                        applyRecords(records, setSeriesData, setSnapshot, setLoadingDevices);
                    } catch (e) {
                        console.error('Error parsing sensors STOMP message:', e);
                    }
                });

                client.subscribe('/topic/device-status', (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        const status = data.status;
                        const id = parseDeviceId(data.deviceId);
                        if (id == null || status == null) return;
                        markHardwareAlive();
                        const isOn = status === 'ON' || status === '1';
                        let keyToClear = null;
                        setDevices((prev) => {
                            const next = { ...prev };
                            for (const key of ['humidifier', 'light', 'fan']) {
                                if (prev[key]?.id === id) {
                                    next[key] = { ...prev[key], isOn, isInit: true };
                                    keyToClear = key;
                                    break;
                                }
                            }
                            return next;
                        });
                        if (keyToClear) {
                            setLoadingDevices((load) => ({ ...load, [keyToClear]: false }));
                        }
                    } catch (e) {
                        console.error('Error parsing device-status STOMP message:', e);
                    }
                });
            },
            onStompError: (frame) => console.error('STOMP error', frame.headers?.message, frame.body),
            onWebSocketClose: () => setIsSocketConnected(false),
            onWebSocketError: () => setIsSocketConnected(false)
        });
        stompRef.current = client;
        try {
            client.activate();
        } catch (e) {
            console.error('STOMP activate failed:', e);
        }
        return () => {
            try {
                client.deactivate();
            } catch (e) { /* noop */ }
            stompRef.current = null;
        };
    }, [markHardwareAlive]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isSocketConnected) fetchLatestData();
            fetchLatestDevices();
            recomputeOnline();
        }, 2000);
        return () => clearInterval(interval);
    }, [fetchLatestData, fetchLatestDevices, isSocketConnected, recomputeOnline]);

    return {
        devices,
        loadingDevices,
        snapshot,
        seriesData,
        setDevices,
        setLoadingDevices,
        isHardwareOnline
    };
};
