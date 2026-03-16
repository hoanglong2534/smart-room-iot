import { useState, useEffect, useCallback, useRef } from 'react';
import { getSensorData, getDevices } from '../services/api';
import { toNumber, toTimeLabel, toSensorKey } from './dashboardUtils';

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
    const socketRef = useRef(null);

    const fetchLatestData = useCallback(async () => {
        try {
            const response = await getSensorData({ page: 0, size: 30, sortType: 'desc' });
            applyRecords(response?.content || [], setSeriesData, setSnapshot, setLoadingDevices);
        } catch (error) {
            console.error('Error fetching latest sensor data:', error);
        }
    }, [applyRecords]);

    const fetchLatestDevices = useCallback(async () => {
        try {
            const response = await getDevices();
            const devicesData = response?.content || response || [];
            if (Array.isArray(devicesData)) {
                setDevices(prev => {
                    const next = { ...prev };
                    devicesData.forEach(serverDevice => {
                        const nameLower = (serverDevice.name || '').toLowerCase();
                        let key = null;
                        if (nameLower.includes('hút ẩm') || nameLower.includes('humidifier')) key = 'humidifier';
                        if (nameLower.includes('đèn') || nameLower.includes('light')) key = 'light';
                        if (nameLower.includes('quạt') || nameLower.includes('fan')) key = 'fan';

                        if (key) {
                            const newIsOn = serverDevice.current_status === 'ON' || serverDevice.current_status === '1';
                            if (prev[key] && prev[key].isOn !== newIsOn) {
                                setLoadingDevices(loadStates => ({ ...loadStates, [key]: false }));
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
        fetchLatestData();
        fetchLatestDevices();
    }, [fetchLatestData, fetchLatestDevices]);

    useEffect(() => {
        const wsUrl = process.env.REACT_APP_SENSOR_WS_URL || 'ws://localhost:12345/smartroom/ws';
        try {
            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;
            socket.onopen = () => setIsSocketConnected(true);
            socket.onclose = () => setIsSocketConnected(false);
            socket.onerror = () => setIsSocketConnected(false);
            socket.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    const records = Array.isArray(payload) ? payload : (Array.isArray(payload?.content) ? payload.content : [payload]);
                    applyRecords(records, setSeriesData, setSnapshot, setLoadingDevices);
                } catch (error) {
                    console.error('Error parsing realtime sensor payload:', error);
                }
            };
        } catch (error) {
            console.error('WebSocket connection init failed:', error);
        }
        return () => {
            if (socketRef.current) socketRef.current.close();
        };
    }, [applyRecords]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isSocketConnected) fetchLatestData();
        }, 2000);
        return () => clearInterval(interval);
    }, [fetchLatestData, isSocketConnected]);

    return { devices, loadingDevices, snapshot, seriesData, setDevices, setLoadingDevices };
};
