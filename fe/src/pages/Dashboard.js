
import React, { useState } from 'react';
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

    return (
        <div className="flex h-screen bg-bg-secondary font-sans text-text-title">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden p-[20px_40px]">
                <header className="py-2.5 mb-5">
                </header>

                <div className="flex-1 overflow-y-auto flex flex-col gap-[25px]">

                    <div className="grid grid-cols-3 gap-[25px]">
                        <div
                            className={`bg-card-humidity rounded-[15px] p-[25px] flex flex-col justify-between cursor-pointer transition-all duration-300
                                ${selectedDevice === 'humidifier' ? 'shadow-[0_20px_40px_rgba(0,0,0,0.1)] -translate-y-[10px] bg-white' : 'shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:-translate-y-[3px]'}`}
                            onClick={() => setSelectedDevice('humidifier')}
                        >
                            <div className="flex justify-between items-center mb-[15px]">
                                <span className="text-[#727681] font-bold text-[1.1rem] tracking-[1px]">ĐỘ ẨM</span>
                                <img src={iconHumidity} alt="Humidity" className="w-[45px] h-[45px] object-contain" />
                            </div>
                            <div className="flex items-center gap-[15px]">
                                <h1 className="text-[5.5rem] m-0 font-semibold text-text-humidity">85%</h1>
                                <img src={iconIncrease} alt="Increase" className="w-[60px] h-[60px] object-contain" />
                            </div>
                            <p className="text-[#727681] text-[1rem] mt-[10px]">20% so với hôm qua</p>
                        </div>

                        <div
                            className={`bg-card-light rounded-[15px] p-[25px] flex flex-col justify-between cursor-pointer transition-all duration-300
                                ${selectedDevice === 'light' ? 'shadow-[0_20px_40px_rgba(0,0,0,0.1)] -translate-y-[10px] bg-white' : 'shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:-translate-y-[3px]'}`}
                            onClick={() => setSelectedDevice('light')}
                        >
                            <div className="flex justify-between items-center mb-[15px]">
                                <span className="text-[#727681] font-bold text-[1.1rem] tracking-[1px]">ÁNH SÁNG</span>
                                <img src={iconLight} alt="Light" className="w-[45px] h-[45px] object-contain" />
                            </div>
                            <div className="flex items-center gap-[15px]">
                                <h1 className="text-[5.5rem] m-0 font-semibold text-text-light">200lx</h1>
                                <img src={iconDecrease} alt="Decrease" className="w-[60px] h-[60px] object-contain" />
                            </div>
                            <p className="text-[#727681] text-[1rem] mt-[10px]">33% so với hôm qua</p>
                        </div>

                        <div
                            className={`bg-card-temp rounded-[15px] p-[25px] flex flex-col justify-between cursor-pointer transition-all duration-300
                                ${selectedDevice === 'fan' ? 'shadow-[0_20px_40px_rgba(0,0,0,0.1)] -translate-y-[10px] bg-white' : 'shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:-translate-y-[3px]'}`}
                            onClick={() => setSelectedDevice('fan')}
                        >
                            <div className="flex justify-between items-center mb-[15px]">
                                <span className="text-[#727681] font-bold text-[1.1rem] tracking-[1px]">NHIỆT ĐỘ</span>
                                <img src={iconTemp} alt="Temp" className="w-[45px] h-[45px] object-contain" />
                            </div>
                            <div className="flex items-center gap-[15px]">
                                <h1 className="text-[5.5rem] m-0 font-semibold text-text-temp">15°C</h1>
                                <img src={iconDecrease} alt="Decrease" className="w-[60px] h-[60px] object-contain" />
                            </div>
                            <p className="text-[#727681] text-[1rem] mt-[10px]">12% so với hôm qua</p>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="flex-1 bg-white rounded-[15px] p-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-card-humidity min-h-[300px]">
                        <div className="h-full flex justify-center items-center bg-card-humidity text-text-humidity text-[1.2rem]">
                            <div className="">Chart Placeholder (Area Chart)</div>
                        </div>
                    </div>

                    {/* Bottom Device Controls */}
                    <div className="grid grid-cols-3 gap-[25px]">
                        {/* Humidifier */}
                        <div
                            className={`p-[25px_30px] rounded-[15px] flex justify-between items-center cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition-transform duration-200 hover:-translate-y-[3px]
                                ${devices.humidifier ? 'bg-card-humidity text-text-humidity' : 'bg-[#D9D9D9] text-[#727681]'}`}
                            onClick={() => toggleDevice('humidifier')}
                        >
                            <div className="block mb-[5px]">
                                <span className={`text-[1rem] font-bold block mb-[5px] ${devices.humidifier ? 'text-[#00838F]' : ''}`}>MÁY HÚT ẨM</span>
                                <h3 className="m-0 text-[1.4rem]">{devices.humidifier ? 'ĐANG BẬT' : 'ĐANG TẮT'}</h3>
                            </div>
                            <img
                                src={devices.humidifier ? gifHumidifierAnim : deviceHumidifierStatic}
                                alt="Humidifier"
                                className="w-[70px] h-[70px] object-contain"
                            />
                        </div>

                        {/* Light */}
                        <div
                            className={`p-[25px_30px] rounded-[15px] flex justify-between items-center cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition-transform duration-200 hover:-translate-y-[3px]
                                ${devices.light ? 'bg-card-light text-text-light' : 'bg-[#D9D9D9] text-[#727681]'}`}
                            onClick={() => toggleDevice('light')}
                        >
                            <div className="block mb-[5px]">
                                <span className={`text-[1rem] font-bold block mb-[5px] ${devices.light ? 'text-[#F9A825]' : ''}`}>ĐÈN</span>
                                <h3 className="m-0 text-[1.4rem]">{devices.light ? 'ĐANG BẬT' : 'ĐANG TẮT'}</h3>
                            </div>
                            <img
                                src={devices.light ? gifLightAnim : deviceLightStatic}
                                alt="Light"
                                className="w-[70px] h-[70px] object-contain"
                            />
                        </div>

                        {/* Fan */}
                        <div
                            className={`p-[25px_30px] rounded-[15px] flex justify-between items-center cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition-transform duration-200 hover:-translate-y-[3px]
                                ${devices.fan ? 'bg-card-temp text-text-temp' : 'bg-[#D9D9D9] text-[#727681]'}`}
                            onClick={() => toggleDevice('fan')}
                        >
                            <div className="block mb-[5px]">
                                <span className={`text-[1rem] font-bold block mb-[5px] ${devices.fan ? 'text-[#C2185B]' : ''}`}>QUẠT</span>
                                <h3 className="m-0 text-[1.4rem]">{devices.fan ? 'ĐANG BẬT' : 'ĐANG TẮT'}</h3>
                            </div>
                            <img
                                src={devices.fan ? gifFanAnim : deviceFanStatic}
                                alt="Fan"
                                className="w-[70px] h-[70px] object-contain"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
