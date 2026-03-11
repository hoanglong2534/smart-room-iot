
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import iconHumidity from '../assets/icon-humidity.png';
import iconLight from '../assets/icon-light.png';
import iconTemp from '../assets/icon-temp.png';
import iconIncrease from '../assets/icon tăng.png';
import iconDecrease from '../assets/giảm icon.png';

import deviceFanStatic from '../assets/device-fan.png';
import deviceLightStatic from '../assets/device-light.png';
import deviceHumidifierStatic from '../assets/device-humidifier.png';
import gifFanAnim from '../assets/gif-fan.gif';
import gifLightAnim from '../assets/gif-light.gif';
import gifHumidifierAnim from '../assets/gif-humidifier.gif';

import StatCard from '../components/StatCard';
import DeviceCard from '../components/DeviceCard';
import DashboardChart from '../components/DashboardChart';
import { getSensorData, controlDevice, getDevices } from '../services/api';

const Dashboard = () => {
    const MAX_POINTS = 10;
    const socketRef = useRef(null);

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

    const [snapshot, setSnapshot] = useState({
        humidity: null,
        light: null,
        temperature: null,
        time: null
    });

    const [seriesData, setSeriesData] = useState({
        humidity: [],
        light: [],
        temperature: []
    });

    const [selectedDevice, setSelectedDevice] = useState('humidifier'); // Default to humidifier

    const toggleDevice = async (deviceKey) => {
        const deviceObj = devices[deviceKey];
        if (!deviceObj.isInit || !deviceObj.id) {
            alert('Chưa tải được cấu hình thiết bị từ server.');
            return;
        }

        const currentState = deviceObj.isOn;
        const action = !currentState ? "ON" : "OFF";

        setLoadingDevices(prev => ({ ...prev, [deviceKey]: true }));

        try {
            await controlDevice({
                deviceId: deviceObj.id.toString(),
                action: action
            });

            // Set a 10s timeout to clear the spinner if the hardware never responds
            setTimeout(() => {
                setLoadingDevices(prev => {
                    if (prev[deviceKey]) {
                        return { ...prev, [deviceKey]: false };
                    }
                    return prev;
                });
            }, 10000);

        } catch (error) {
            console.error("Failed to toggle device", error);
            setLoadingDevices(prev => ({ ...prev, [deviceKey]: false }));
            if (error?.response?.status !== 200) {
                alert("Lỗi khi gửi lệnh điều khiển. Vui lòng thử lại.");
            }
        }
    };

    const toNumber = (value) => {
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
    };

    const toTimeLabel = (rawTime) => {
        if (!rawTime) return '--:--:--';
        const date = new Date(rawTime);
        if (Number.isNaN(date.getTime())) return '--:--:--';
        return date.toLocaleTimeString('vi-VN', { hour12: false });
    };

    const toSensorKey = (name = '') => {
        const normalized = String(name).toLowerCase();

        if (normalized.includes('độ ẩm') || normalized.includes('do am') || normalized.includes('humidity')) {
            return 'humidity';
        }

        if (normalized.includes('ánh sáng') || normalized.includes('anh sang') || normalized.includes('light')) {
            return 'light';
        }

        if (normalized.includes('nhiệt độ') || normalized.includes('nhiet do') || normalized.includes('temperature')) {
            return 'temperature';
        }

        return null;
    };

    const applyRecords = useCallback((records = []) => {
        if (!records.length) return;

        const sorted = [...records].sort((a, b) => {
            const ta = new Date(a.from || a.time || 0).getTime();
            const tb = new Date(b.from || b.time || 0).getTime();
            return ta - tb;
        });

        setSeriesData(prev => {
            const next = {
                humidity: [...prev.humidity],
                light: [...prev.light],
                temperature: [...prev.temperature]
            };

            let latestTime = null;
            let latestHumidity = null;
            let latestLight = null;
            let latestTemperature = null;

            sorted.forEach((record) => {
                const key = toSensorKey(record.name);
                const value = toNumber(record.value);
                const time = record.from || record.time;

                if (!key || value === null) return;

                next[key].push({
                    time: toTimeLabel(time),
                    value
                });

                if (next[key].length > MAX_POINTS) {
                    next[key] = next[key].slice(-MAX_POINTS);
                }

                latestTime = time || latestTime;
                if (key === 'humidity') latestHumidity = value;
                if (key === 'light') latestLight = value;
                if (key === 'temperature') latestTemperature = value;
            });

            if (latestHumidity !== null || latestLight !== null || latestTemperature !== null) {
                setSnapshot(prevSnapshot => ({
                    humidity: latestHumidity ?? prevSnapshot.humidity,
                    light: latestLight ?? prevSnapshot.light,
                    temperature: latestTemperature ?? prevSnapshot.temperature,
                    time: latestTime || prevSnapshot.time
                }));
            }

            return next;
        });
    }, []);

    const fetchLatestData = useCallback(async () => {
        try {
            const response = await getSensorData({
                page: 0,
                size: 30,
                sortType: 'desc'
            });

            applyRecords(response?.content || []);
        } catch (error) {
            console.error('Error fetching latest sensor data:', error);
        }
    }, [applyRecords]);

    const fetchLatestDevices = useCallback(async () => {
        try {
            const response = await getDevices();
            if (response && Array.isArray(response)) {
                setDevices(prev => {
                    const next = { ...prev };
                    response.forEach(serverDevice => {
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

                            next[key] = {
                                isOn: newIsOn,
                                id: serverDevice.id,
                                isInit: true
                            };
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

            socket.onopen = () => {
                setIsSocketConnected(true);
            };

            socket.onclose = () => {
                setIsSocketConnected(false);
            };

            socket.onerror = () => {
                setIsSocketConnected(false);
            };

            socket.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);

                    if (Array.isArray(payload)) {
                        applyRecords(payload);
                    } else if (Array.isArray(payload?.content)) {
                        applyRecords(payload.content);
                    } else {
                        applyRecords([payload]);
                    }
                } catch (error) {
                    console.error('Error parsing realtime sensor payload:', error);
                }
            };
        } catch (error) {
            console.error('WebSocket connection init failed:', error);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [applyRecords]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isSocketConnected) {
                fetchLatestData();
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [fetchLatestData, isSocketConnected]);

    const chartData = useMemo(() => {
        if (selectedDevice === 'humidifier') return seriesData.humidity;
        if (selectedDevice === 'light') return seriesData.light;
        if (selectedDevice === 'fan') return seriesData.temperature;
        return [];
    }, [selectedDevice, seriesData]);

    const getTrend = (series = []) => {
        if (series.length < 2) {
            return {
                icon: iconIncrease,
                text: 'Chưa đủ dữ liệu để so sánh'
            };
        }

        const last = series[series.length - 1].value;
        const prev = series[series.length - 2].value;
        const diff = last - prev;

        let percentageText = '';
        if (prev === 0) {
            percentageText = `${Math.abs(diff).toFixed(1)}°/lx/% so với lần đo trước`;
        } else {
            const percentage = (Math.abs(diff) / prev) * 100;
            // Dùng toFixed(2) nếu % nhỏ, hoặc toFixed(1)
            percentageText = `${percentage.toFixed(1)}% so với lần đo trước`;
        }

        return {
            icon: diff >= 0 ? iconIncrease : iconDecrease,
            text: percentageText
        };
    };

    const humidityTrend = getTrend(seriesData.humidity);
    const lightTrend = getTrend(seriesData.light);
    const temperatureTrend = getTrend(seriesData.temperature);

    const humidityValue = snapshot.humidity !== null ? `${snapshot.humidity}%` : '--%';
    const lightValue = snapshot.light !== null ? `${snapshot.light}lx` : '--lx';
    const temperatureValue = snapshot.temperature !== null ? `${snapshot.temperature}°C` : '--°C';

    return (
        <div className="flex h-screen bg-bg-secondary font-sans text-text-title">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden p-[20px_40px]">
                <header className="py-2.5 mb-5">
                </header>

                <div className="flex-1 overflow-y-auto flex flex-col gap-[25px] p-4">

                    <div className="grid grid-cols-3 gap-[25px]">
                        <StatCard
                            title="ĐỘ ẨM"
                            icon={iconHumidity}
                            value={humidityValue}
                            trendIcon={humidityTrend.icon}
                            trendText={humidityTrend.text}
                            isActive={selectedDevice === 'humidifier'}
                            onClick={() => setSelectedDevice('humidifier')}
                            bgClass="bg-card-humidity"
                            textClass="text-text-humidity"
                        />
                        <StatCard
                            title="ÁNH SÁNG"
                            icon={iconLight}
                            value={lightValue}
                            trendIcon={lightTrend.icon}
                            trendText={lightTrend.text}
                            isActive={selectedDevice === 'light'}
                            onClick={() => setSelectedDevice('light')}
                            bgClass="bg-card-light"
                            textClass="text-text-light"
                        />
                        <StatCard
                            title="NHIỆT ĐỘ"
                            icon={iconTemp}
                            value={temperatureValue}
                            trendIcon={temperatureTrend.icon}
                            trendText={temperatureTrend.text}
                            isActive={selectedDevice === 'fan'}
                            onClick={() => setSelectedDevice('fan')}
                            bgClass="bg-card-temp"
                            textClass="text-text-temp"
                        />
                    </div>

                    {/* Chart*/}
                    <div className="flex-1 bg-white rounded-[15px] p-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-[#E0E0E0] min-h-[300px]">
                        <div className="h-full w-full min-h-[300px]" style={{ height: '300px' }}>
                            <DashboardChart data={chartData} type={selectedDevice} />
                        </div>
                    </div>

                    {/*  Controls */}
                    <div className="grid grid-cols-3 gap-[25px]">
                        <DeviceCard
                            name="MÁY HÚT ẨM"
                            isOn={devices.humidifier.isOn}
                            isLoading={!devices.humidifier.isInit || loadingDevices.humidifier}
                            iconStatic={deviceHumidifierStatic}
                            iconGif={gifHumidifierAnim}
                            onClick={() => toggleDevice('humidifier')}
                            activeBgClass="bg-card-humidity"
                            activeTextClass="text-text-humidity"
                            activeTitleColor="text-[#00838F]"
                        />
                        <DeviceCard
                            name="ĐÈN"
                            isOn={devices.light.isOn}
                            isLoading={!devices.light.isInit || loadingDevices.light}
                            iconStatic={deviceLightStatic}
                            iconGif={gifLightAnim}
                            onClick={() => toggleDevice('light')}
                            activeBgClass="bg-card-light"
                            activeTextClass="text-text-light"
                            activeTitleColor="text-[#F9A825]"
                        />
                        <DeviceCard
                            name="QUẠT"
                            isOn={devices.fan.isOn}
                            isLoading={!devices.fan.isInit || loadingDevices.fan}
                            iconStatic={deviceFanStatic}
                            iconGif={gifFanAnim}
                            onClick={() => toggleDevice('fan')}
                            activeBgClass="bg-card-temp"
                            activeTextClass="text-text-temp"
                            activeTitleColor="text-[#C2185B]"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
