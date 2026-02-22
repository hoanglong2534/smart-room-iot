
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import iconDashboard from '../assets/icon-dashboard.png';
import iconSensor from '../assets/icon-sensor-data.png';
import iconHistory from '../assets/icon-history.png';
import iconProfile from '../assets/icon-profile.png';
import iconLogout from '../assets/icon-logout.png';
import logoText from '../assets/logo-text.png';
import iconCloseNav from '../assets/icon-close-nav.png';
import avatarImg from '../assets/avatar.png';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    const menuItems = [
        { name: 'Tổng quan', icon: iconDashboard, path: '/dashboard' },
        { name: 'Dữ liệu cảm biến', icon: iconSensor, path: '/sensor-data' },
        { name: 'Lịch sử hành động', icon: iconHistory, path: '/history' },
        { name: 'Hồ sơ', icon: iconProfile, path: '/profile' },
    ];

    return (
        <aside className={`flex flex-col border-r border-[#EFEBE9] transition-[width] duration-300 ease h-screen bg-gradient-to-b from-bg-secondary to-bg-dark ${isCollapsed ? 'w-[90px] p-[30px_15px]' : 'w-[360px] p-[30px_20px]'}`}>
            <div className="mb-12 flex flex-col w-full">
                <div className={`flex w-full mb-4 pr-3 ${isCollapsed ? 'justify-center pr-0' : 'justify-end'}`}>
                    <img
                        src={iconCloseNav}
                        alt="Toggle Sidebar"
                        className={`w-6 h-6 cursor-pointer opacity-70 transition-all duration-300 hover:opacity-100 ${isCollapsed ? 'rotate-180' : ''}`}
                        onClick={toggleSidebar}
                    />
                </div>
                {!isCollapsed && (
                    <div className="flex items-center justify-center gap-3 whitespace-nowrap overflow-hidden">
                        <img src={logoText} alt="Logo" className="h-[40px] object-contain" />
                        <h3 className="text-text-title m-0 text-[1.4rem] font-[800] tracking-[0.5px] leading-none whitespace-nowrap">SMART ROOM</h3>
                    </div>
                )}
            </div>

            <nav className="flex-1 flex flex-col gap-[15px]">
                {menuItems.map((item) => (
                    <div
                        key={item.name}
                        className={`flex items-center gap-[15px] p-[16px_20px] no-underline rounded-xl font-semibold text-[1.1rem] transition-all duration-300 cursor-pointer whitespace-nowrap overflow-hidden 
                            ${location.pathname === item.path
                                ? 'bg-brand text-white shadow-[0_4px_10px_rgba(140,106,63,0.3)]'
                                : 'text-text-title hover:bg-bg-dark'}
                            ${isCollapsed ? 'justify-center p-[16px_0]' : ''}`}
                        onClick={() => navigate(item.path)}
                        title={isCollapsed ? item.name : ''}
                    >
                        <img
                            src={item.icon}
                            alt={item.name}
                            className={`w-7 h-7 object-contain transition-all duration-300 ${location.pathname === item.path
                                ? 'brightness-0 invert'
                                : 'brightness-0 opacity-60 hover:brightness-100 hover:opacity-100'
                                }`}
                        />
                        {!isCollapsed && <span>{item.name}</span>}
                    </div>
                ))}
            </nav>

            <div className="mt-auto border-t border-[#EFEBE9] pt-5">
                <div className={`flex items-center gap-3 whitespace-nowrap overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-[50px] h-[50px] rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                        <img 
                            src={avatarImg} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                            style={{ 
                                transform: 'scale(1.3)',
                                objectPosition: 'center 20%'
                            }}
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <span className="text-base font-bold">Phạm Xuân Hoàng Long</span>
                        </div>
                    )}
                    {!isCollapsed && (
                        <button onClick={handleLogout} className="bg-none border-none text-[#727681] cursor-pointer text-[1.2rem] p-[5px]">
                            <img src={iconLogout} alt="Logout" style={{ width: '20px' }} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
