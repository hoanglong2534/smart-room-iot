
import React, { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import iconHumidity from '../assets/icon-humidity.png';
import iconLight from '../assets/icon-light.png';
import iconTemp from '../assets/icon-temp.png';

import deviceFanStatic from '../assets/device-fan.png';
import deviceLightStatic from '../assets/device-light.png';
import deviceHumidifierStatic from '../assets/device-humidifier.png';
import gifFanAnim from '../assets/gif-fan.gif';
import gifLightAnim from '../assets/gif-light.gif';
import gifHumidifierAnim from '../assets/gif-humidifier.gif';

import StatCard from '../components/StatCard';
import DeviceCard from '../components/DeviceCard';
import DashboardChart from '../components/DashboardChart';
import { controlDevice } from '../services/api';
import { getTrend, applyRecords } from '../utils/dashboardUtils';
import { useDashboardData } from '../utils/useDashboardData';

const Dashboard = () => {
    const { devices, loadingDevices, snapshot, seriesData, setDevices, setLoadingDevices } = useDashboardData(applyRecords);
    const [selectedDevice, setSelectedDevice] = useState('humidifier');

    const toggleDevice = async (deviceKey) => {
        const deviceObj = devices[deviceKey];
        if (!deviceObj.isInit || !deviceObj.id) {
            alert('Chưa tải được cấu hình thiết bị từ server.');
            return;
        }

        const action = !deviceObj.isOn ? "ON" : "OFF";
        setLoadingDevices(prev => ({ ...prev, [deviceKey]: true }));

        try {
            await controlDevice({ deviceId: deviceObj.id.toString(), action: action });
            setTimeout(() => {
                setLoadingDevices(prev => (prev[deviceKey] ? { ...prev, [deviceKey]: false } : prev));
            }, 10000);
        } catch (error) {
            console.error("Failed to toggle device", error);
            setLoadingDevices(prev => ({ ...prev, [deviceKey]: false }));
            alert("Lỗi khi gửi lệnh điều khiển.");
        }
    };

    const chartData = useMemo(() => {
        if (selectedDevice === 'humidifier') return seriesData.humidity;
        if (selectedDevice === 'light') return seriesData.light;
        if (selectedDevice === 'fan') return seriesData.temperature;
        return [];
    }, [selectedDevice, seriesData]);

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
                <header className="py-2.5 mb-5"></header>
                <div className="flex-1 overflow-y-auto flex flex-col gap-[25px] p-4">
                    <div className="grid grid-cols-3 gap-[25px]">
                        <StatCard title="ĐỘ ẨM" icon={iconHumidity} value={humidityValue} trendIcon={humidityTrend.icon} trendText={humidityTrend.text} isActive={selectedDevice === 'humidifier'} onClick={() => setSelectedDevice('humidifier')} bgClass="bg-card-humidity" textClass="text-text-humidity" />
                        <StatCard title="ÁNH SÁNG" icon={iconLight} value={lightValue} trendIcon={lightTrend.icon} trendText={lightTrend.text} isActive={selectedDevice === 'light'} onClick={() => setSelectedDevice('light')} bgClass="bg-card-light" textClass="text-text-light" />
                        <StatCard title="NHIỆT ĐỘ" icon={iconTemp} value={temperatureValue} trendIcon={temperatureTrend.icon} trendText={temperatureTrend.text} isActive={selectedDevice === 'fan'} onClick={() => setSelectedDevice('fan')} bgClass="bg-card-temp" textClass="text-text-temp" />
                    </div>
                    <div className="flex-1 bg-white rounded-[15px] p-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-[#E0E0E0] min-h-[300px]">
                        <div className="h-full w-full min-h-[300px]" style={{ height: '300px' }}>
                            <DashboardChart data={chartData} type={selectedDevice} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-[25px]">
                        <DeviceCard name="MÁY HÚT ẨM" isOn={devices.humidifier.isOn} isLoading={loadingDevices.humidifier} iconStatic={deviceHumidifierStatic} iconGif={gifHumidifierAnim} onClick={() => toggleDevice('humidifier')} activeBgClass="bg-card-humidity" activeTextClass="text-text-humidity" activeTitleColor="text-[#00838F]" />
                        <DeviceCard name="ĐÈN" isOn={devices.light.isOn} isLoading={loadingDevices.light} iconStatic={deviceLightStatic} iconGif={gifLightAnim} onClick={() => toggleDevice('light')} activeBgClass="bg-card-light" activeTextClass="text-text-light" activeTitleColor="text-[#F9A825]" />
                        <DeviceCard name="QUẠT" isOn={devices.fan.isOn} isLoading={loadingDevices.fan} iconStatic={deviceFanStatic} iconGif={gifFanAnim} onClick={() => toggleDevice('fan')} activeBgClass="bg-card-temp" activeTextClass="text-text-temp" activeTitleColor="text-[#C2185B]" />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
