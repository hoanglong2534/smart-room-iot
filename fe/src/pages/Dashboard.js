
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Dashboard = () => {
    const navigate = useNavigate();

    const [devices, setDevices] = useState({
        humidifier: true,
        light: false,
        fan: true
    });

    const [selectedDevice, setSelectedDevice] = useState('humidifier'); // Default to humidifier

    const toggleDevice = (device) => {
        setDevices(prev => ({
            ...prev,
            [device]: !prev[device]
        }));
    };

    // Mock Data Generator
    const chartData = useMemo(() => {
        const generateData = (min, max) => {
            return Array.from({ length: 10 }, (_, i) => ({
                time: `10:00:0${i}`,
                value: Math.floor(Math.random() * (max - min + 1)) + min
            }));
        };

        switch (selectedDevice) {
            case 'humidifier': // Humidity: 60-90%
                return generateData(60, 90);
            case 'light': // Light: 40-80% (intensity)
                return generateData(40, 80);
            case 'fan': // Temp: 20-40 (scaled or raw) -> let's use 20-40 C
                return generateData(20, 40);
            default:
                return generateData(0, 100);
        }
    }, [selectedDevice]);

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
                            value="85%"
                            trendIcon={iconIncrease}
                            trendText="20% so với hôm qua"
                            isActive={selectedDevice === 'humidifier'}
                            onClick={() => setSelectedDevice('humidifier')}
                            bgClass="bg-card-humidity"
                            textClass="text-text-humidity"
                        />
                        <StatCard
                            title="ÁNH SÁNG"
                            icon={iconLight}
                            value="200lx"
                            trendIcon={iconDecrease}
                            trendText="33% so với hôm qua"
                            isActive={selectedDevice === 'light'}
                            onClick={() => setSelectedDevice('light')}
                            bgClass="bg-card-light"
                            textClass="text-text-light"
                        />
                        <StatCard
                            title="NHIỆT ĐỘ"
                            icon={iconTemp}
                            value="15°C"
                            trendIcon={iconDecrease}
                            trendText="12% so với hôm qua"
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
                            isOn={devices.humidifier}
                            iconStatic={deviceHumidifierStatic}
                            iconGif={gifHumidifierAnim}
                            onClick={() => toggleDevice('humidifier')}
                            activeBgClass="bg-card-humidity"
                            activeTextClass="text-text-humidity"
                            activeTitleColor="text-[#00838F]"
                        />
                        <DeviceCard
                            name="ĐÈN"
                            isOn={devices.light}
                            iconStatic={deviceLightStatic}
                            iconGif={gifLightAnim}
                            onClick={() => toggleDevice('light')}
                            activeBgClass="bg-card-light"
                            activeTextClass="text-text-light"
                            activeTitleColor="text-[#F9A825]"
                        />
                        <DeviceCard
                            name="QUẠT"
                            isOn={devices.fan}
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
