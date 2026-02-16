
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import smartRoomBg from '../assets/smart-room-bg.png';
import iconMorning from '../assets/icon-morning.png';
import iconAfternoon from '../assets/icon-afternoon.png';
import iconEvening from '../assets/icon-evening.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 12) {
            return { text: 'Chào buổi sáng!', icon: iconMorning };
        } else if (hour >= 12 && hour < 18) {
            return { text: 'Chào buổi chiều!', icon: iconAfternoon };
        } else {
            return { text: 'Chào buổi tối!', icon: iconEvening };
        }
    };

    const { text: greetingText, icon: greetingIcon } = getGreeting();

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin@123') {
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/dashboard');
        } else {
            setError('Tên đăng nhập hoặc mật khẩu không đúng');
        }
    };

    return (
        <div className="flex h-screen w-screen font-sans overflow-hidden">
            <div className="flex-1 flex justify-center items-center p-10 bg-gradient-to-b from-bg-secondary to-bg-dark">
                <div className="w-full max-w-[400px]">
                    <div className="mb-10 text-center">
                        <h2 className="text-[1.8rem] text-text-title mb-2.5 flex items-center justify-center gap-2.5 font-bold leading-none">
                            <img src={greetingIcon} alt="Greeting Icon" className="w-8 h-8 object-contain" />
                            {greetingText}
                        </h2>
                        <p className="text-text-body text-[0.95rem] m-0">Hãy nhập các thông tin cần thiết để đăng nhập</p>
                    </div>

                    <form onSubmit={handleLogin} className="w-full">
                        <div className="mb-5">
                            <label className="block mb-2 text-text-title font-medium text-sm">Tên đăng nhập</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-200 rounded-lg text-base bg-white transition-colors text-text-title focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                            />
                        </div>

                        <div className="mb-5">
                            <label className="block mb-2 text-text-title font-medium text-sm">Mật khẩu</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-200 rounded-lg text-base bg-white transition-colors text-text-title focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                            />
                        </div>

                        {error && <div className="text-[#d32f2f] bg-[#ffebee] p-2.5 rounded-md mb-5 text-sm">{error}</div>}

                        <button type="submit" className="w-full p-3.5 bg-brand text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-colors mt-2.5 hover:bg-brand-hover">
                            Đăng nhập
                        </button>

                        <div className="mt-6 text-center text-sm text-text-body">
                            <p>Bạn không có tài khoản? <a href="https://docs.google.com/forms/d/e/1FAIpQLSebncuEQA6MSFd-jOD59SIPKa_IwCdH4WA6JUgTqxoHDVdZRA/viewform?usp=publish-editor" target="_blank" rel="noopener noreferrer" className="text-text-title font-semibold no-underline">Liên hệ với chúng tôi</a></p>
                        </div>
                    </form>
                </div>
            </div>

            <div className="flex-[1.2] bg-[#333] bg-[length:100%_100%] bg-center relative" style={{ backgroundImage: `url(${smartRoomBg})` }}>
                <div className="absolute inset-0 bg-black/20 flex justify-center items-center">
                </div>
            </div>
        </div>
    );
};

export default Login;
