
import React, { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import iconHumidity from '../assets/icon-humidity.png';
import iconLight from '../assets/icon-light.png';
import iconTemp from '../assets/icon-temp.png';
import iconDust from '../assets/dust.png';

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

/**
 * Helper component to render sensor values with consistent styling
 */
const SensorValue = ({ value, unit }) => {
    if (value === null || value === undefined) return '--';
    return (
        <span className="flex flex-col items-center leading-tight min-w-0">
            <span className="text-[2.5rem] font-extrabold tracking-tight">{value}</span>
            <span className="text-[1.1rem] opacity-50 font-medium tracking-wide uppercase">{unit}</span>
        </span>
    );
};

const Dashboard = () => {
    const { devices, loadingDevices, snapshot, seriesData, setDevices, setLoadingDevices, recordManualClick, isHardwareOnline } = useDashboardData(applyRecords);
    const [selectedDevice, setSelectedDevice] = useState('all');

    const toggleDevice = async (deviceKey) => {
        if (!isHardwareOnline) {
            alert('Thiết bị đang mất kết nối, không thể điều khiển.');
            return;
        }
        const deviceObj = devices[deviceKey];
        if (!deviceObj.isInit || !deviceObj.id) {
            alert('Chưa tải được cấu hình thiết bị từ server.');
            return;
        }

        const action = !deviceObj.isOn ? "ON" : "OFF";
        setLoadingDevices(prev => ({ ...prev, [deviceKey]: true }));

        // --- REAL HARDWARE SYNC ---
        // Instead of optimistic update, we just set loading to true.
        // The actual isOn state will toggle ONLY when the STOMP message arrives from hardware.
        setLoadingDevices(prev => ({ ...prev, [deviceKey]: true }));

        try {
            recordManualClick(deviceKey);
            await controlDevice({ deviceId: deviceObj.id.toString(), action: action });
            // The loading state will be cleared by the STOMP message listener
            // or by the polling `fetchLatestDevices` call.
            // 10-second failsafe to clear loading if hardware never responds
            setTimeout(() => {
                setLoadingDevices(prev => ({ ...prev, [deviceKey]: false }));
            }, 10000); 
        } catch (error) {
            console.error("Failed to toggle device", error);
            setLoadingDevices(prev => ({ ...prev, [deviceKey]: false }));
            alert("Lỗi khi gửi lệnh điều khiển.");
        }
    };

    const chartData = useMemo(() => {
        if (selectedDevice === 'all') {
            return {
                temperature: seriesData.temperature,
                humidity: seriesData.humidity,
                light: seriesData.light,
                dust: seriesData.dust
            };
        }
        if (selectedDevice === 'dust') return seriesData.dust;
        if (selectedDevice === 'humidifier') return seriesData.humidity;
        if (selectedDevice === 'light') return seriesData.light;
        if (selectedDevice === 'fan') return seriesData.temperature;
        return [];
    }, [selectedDevice, seriesData]);

    // --- Values & Trends ---
    const humidityTrend = getTrend(seriesData.humidity);
    const lightTrend = getTrend(seriesData.light);
    const temperatureTrend = getTrend(seriesData.temperature);
    const dustTrend = getTrend(seriesData.dust);

    // Format values for main StatCards
    const humidityVal = <SensorValue value={snapshot.humidity} unit="%" />;
    const lightVal = <SensorValue value={snapshot.light} unit="lx" />;
    const temperatureVal = <SensorValue value={snapshot.temperature} unit="°C" />;
    const dustVal = <SensorValue value={snapshot.dust} unit="µg/m³" />;

    // Simple strings for the "All" StatCard compact view
    const fmt = (val, unit) => (val !== null ? `${val}${unit}` : `--${unit}`);
    const compactSensors = [
        { key: 'hum', label: 'Độ ẩm', icon: iconHumidity, value: fmt(snapshot.humidity, '%'), trend: humidityTrend.icon },
        { key: 'light', label: 'Ánh sáng', icon: iconLight, value: fmt(snapshot.light, 'lx'), trend: lightTrend.icon },
        { key: 'temp', label: 'Nhiệt độ', icon: iconTemp, value: fmt(snapshot.temperature, '°C'), trend: temperatureTrend.icon },
        { key: 'dust', label: 'Độ bụi', icon: iconDust, value: snapshot.dust !== null ? `${snapshot.dust}` : '--', trend: dustTrend.icon }
    ];

    const getLiquidFillStyle = (type, val) => {
        if (val === null) return { height: '0%', backgroundColor: 'transparent' };
        let color = '';
        let percentage = 0;
        if (type === 'temperature') {
            color = 'rgba(244, 67, 54, 0.15)'; // Hot Red
            percentage = Math.min(Math.max((val / 50) * 100, 0), 100); 
        } else if (type === 'humidity') {
            color = 'rgba(91, 212, 212, 0.15)'; // Deep Cyan
            percentage = Math.min(Math.max(val, 0), 100);
        } else if (type === 'light') {
            color = 'rgba(251, 192, 45, 0.15)'; // Bright Gold
            percentage = Math.min(Math.max((val / 1000) * 100, 0), 100);
        } else if (type === 'dust') {
            color = 'rgba(158, 158, 158, 0.15)'; // Gray
            percentage = Math.min(Math.max((val / 300) * 100, 0), 100);
        }
        return { 
            height: `${percentage}%`,
            backgroundColor: color
        };
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] font-sans text-[#2D3436]">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden min-h-0 p-[20px_40px]">
                <header className="py-2.5 mb-5 flex justify-between items-center">
                    {!isHardwareOnline && (
                        <div className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full border border-red-200 animate-pulse shadow-sm">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="font-bold text-sm">MẤT KẾT NỐI VỚI MẠCH</span>
                        </div>
                    )}
                </header>
                <div className="flex-1 flex flex-col gap-4 2xl:gap-6 p-4 2xl:p-6 transition-opacity duration-500 overflow-hidden min-h-0">
                    <div className="grid grid-cols-5 gap-4 2xl:gap-6 items-stretch h-[160px] xl:h-[200px] 2xl:h-[240px]">
                        <StatCard
                            title="TẤT CẢ"
                            icon={null}
                            value=""
                            trendIcon={null}
                            trendText="Hiển thị tất cả"
                            isActive={selectedDevice === 'all'}
                            onClick={() => setSelectedDevice('all')}
                            bgClass="bg-white h-full"
                            textClass="text-text-temp"
                            compactItems={compactSensors}
                        />
                        <StatCard 
                            title="ĐỘ ẨM" 
                            icon={iconHumidity} 
                            value={humidityVal} 
                            trendIcon={humidityTrend.icon} 
                            trendText={humidityTrend.text} 
                            isActive={selectedDevice === 'humidifier'} 
                            onClick={() => setSelectedDevice('humidifier')} 
                            bgClass="bg-white h-full" 
                            textClass="text-text-humidity" 
                            style={getLiquidFillStyle('humidity', snapshot.humidity)} 
                        />
                        <StatCard 
                            title="ÁNH SÁNG" 
                            icon={iconLight} 
                            value={lightVal} 
                            trendIcon={lightTrend.icon} 
                            trendText={lightTrend.text} 
                            isActive={selectedDevice === 'light'} 
                            onClick={() => setSelectedDevice('light')} 
                            bgClass="bg-white h-full" 
                            textClass="text-text-light" 
                            style={getLiquidFillStyle('light', snapshot.light)} 
                        />
                        <StatCard 
                            title="NHIỆT ĐỘ" 
                            icon={iconTemp} 
                            value={temperatureVal} 
                            trendIcon={temperatureTrend.icon} 
                            trendText={temperatureTrend.text} 
                            isActive={selectedDevice === 'fan'} 
                            onClick={() => setSelectedDevice('fan')} 
                            bgClass="bg-white h-full" 
                            textClass="text-text-temp" 
                            style={getLiquidFillStyle('temperature', snapshot.temperature)} 
                        />
                        <StatCard 
                            title="ĐỘ BỤI" 
                            icon={iconDust} 
                            value={dustVal} 
                            trendIcon={dustTrend.icon} 
                            trendText={dustTrend.text} 
                            isActive={selectedDevice === 'dust'} 
                            onClick={() => setSelectedDevice('dust')} 
                            bgClass="bg-white h-full" 
                            textClass="text-gray-600" 
                            style={getLiquidFillStyle('dust', snapshot.dust)} 
                        />
                    </div>
                    <div className="flex-1 bg-white rounded-[20px] p-4 2xl:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#f0f0f0] min-h-0 flex flex-col">
                        <div className="flex-1 w-full min-h-0">
                            <DashboardChart data={chartData} type={selectedDevice} />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 2xl:gap-6 h-[120px] lg:h-[150px] 2xl:h-[180px] shrink-0">
                        <DeviceCard name="MÁY HÚT ẨM" isOn={devices.humidifier.isOn} isLoading={loadingDevices.humidifier} isHardwareOnline={isHardwareOnline} iconStatic={deviceHumidifierStatic} iconGif={gifHumidifierAnim} onClick={() => toggleDevice('humidifier')} activeBgClass="bg-card-humidity" activeTextClass="text-text-humidity" activeTitleColor="text-[#00838F]" />
                        <DeviceCard name="ĐÈN" isOn={devices.light.isOn} isLoading={loadingDevices.light} isHardwareOnline={isHardwareOnline} iconStatic={deviceLightStatic} iconGif={gifLightAnim} onClick={() => toggleDevice('light')} activeBgClass="bg-card-light" activeTextClass="text-text-light" activeTitleColor="text-[#F9A825]" />
                        <DeviceCard name="QUẠT" isOn={devices.fan.isOn} isLoading={loadingDevices.fan} isHardwareOnline={isHardwareOnline} iconStatic={deviceFanStatic} iconGif={gifFanAnim} onClick={() => toggleDevice('fan')} activeBgClass="bg-card-temp" activeTextClass="text-text-temp" activeTitleColor="text-[#C2185B]" />
                        <DeviceCard name="BÁO ĐỘNG BỤI" isOn={devices.dustWarning.isOn} isLoading={loadingDevices.dustWarning} isHardwareOnline={isHardwareOnline} iconStatic={iconDust} iconGif={iconDust} onClick={() => {}} activeBgClass="bg-gray-600" activeTextClass="text-white" activeTitleColor="text-white" />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
