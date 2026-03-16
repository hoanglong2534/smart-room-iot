import React from 'react';
import Sidebar from '../components/Sidebar';
import avatarImg from '../assets/avatar.png';
import iconApi from '../assets/API icon.png';
import iconFigma from '../assets/arcticons_figma.png';
import iconGithub from '../assets/arcticons_github.png';
import iconReport from '../assets/arcticons_pdfn-up.png';

import iconStudent from '../assets/image 10.png';
import iconClass from '../assets/image 3.png';
import iconFaculty from '../assets/image 11.png';
import iconDob from '../assets/image 4.png';
import iconPhone from '../assets/image 12.png';
import iconEmail from '../assets/image 7.png';

const Profile = () => {
    const user = {
        name: 'PHẠM XUÂN HOÀNG LONG',
        quote: 'Kiến tạo không gian sống thông minh qua công nghệ.',
        studentId: 'B22DCPT148',
        classId: 'D22PTDPT02',
        faculty: 'Khoa Đa phương tiện',
        dob: '25 - 03 - 2004',
        phone: '0988226705',
        email: 'phamxuanhoanglong.work@gmail.com'
    };

    const InfoItem = ({ icon, label, value }) => (
        <div className="flex items-start gap-[15px]">
            <img src={icon} alt={label} className="w-[40px] h-[40px] object-contain flex-shrink-0" />
            <div>
                <p className="text-[#3A2F24] text-[0.9rem] font-medium mb-[2px]">{label}</p>
                <p className="text-[#3A2F24] font-bold text-[1.1rem]">{value}</p>
            </div>
        </div>
    );

    const ActionButton = ({ icon, label, href, ...props }) => (
        <div className="flex flex-col items-center gap-[12px] w-[160px]">
            <span className="font-bold text-[1.1rem] text-[#3A2F24]">
                {label}
            </span>
            <a
                href={href || "#"}
                {...props}
                className="group bg-[#FAF7F2] rounded-[22px] p-[30px] flex items-center justify-center cursor-pointer transition-all duration-300 w-full aspect-square hover:bg-[#3A2F24] hover:-translate-y-1 hover:shadow-lg"
            >
                <img
                    src={icon}
                    alt={label}
                    className="w-full h-full object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                />
            </a>
        </div>
    );

    return (
        <div className="flex h-screen bg-bg-secondary font-sans text-text-title">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden p-[20px_40px]">
                <header className="mb-[20px] flex items-center justify-between">

                </header>

                <div className="flex-1 overflow-y-auto">
                    <div className="bg-[#FAF7F2] rounded-[25px] p-[35px_50px] shadow-[0_15px_30px_rgba(0,0,0,0.06)] mb-[25px] flex flex-col gap-[30px]">

                        <div className="flex items-start gap-[40px]">
                            <div className="w-[180px] h-[180px] rounded-full border-[5px] border-white shadow-lg flex-shrink-0 mt-[10px] overflow-hidden">
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
                            <div className="flex-1 pt-[15px]">
                                <h1 className="text-[2.5rem] font-bold text-[#3A2F24] mb-[12px] uppercase tracking-wide leading-tight">
                                    {user.name}
                                </h1>
                                <p className="text-[#6B543E] text-[1.1rem] font-medium">
                                    {user.quote}
                                </p>
                            </div>
                        </div>

                        {/* Info Grid Section */}
                        <div className="grid grid-cols-3 gap-x-[60px] gap-y-[40px]">
                            <InfoItem icon={iconStudent} label="Mã sinh viên" value={user.studentId} />
                            <InfoItem icon={iconFaculty} label="Khoa" value={user.faculty} />
                            <InfoItem icon={iconPhone} label="Số điện thoại" value={user.phone} />
                            <InfoItem icon={iconClass} label="Lớp" value={user.classId} />
                            <InfoItem icon={iconDob} label="Ngày sinh" value={user.dob} />
                            <InfoItem icon={iconEmail} label="Email" value={user.email} />
                        </div>
                    </div>

                    {/* Actions Grid */}
                    <div className="flex justify-between pt-[25px]">
                        <ActionButton icon={iconReport} label="Báo cáo" />
                        <ActionButton icon={iconApi} label="Tài liệu API" href="http://localhost:12345/swagger-ui/index.html" target="_blank" rel="noopener noreferrer" />
                        <ActionButton icon={iconFigma} label="Figma" target="_blank" rel="noopener noreferrer" href="https://www.figma.com/design/FlcxqATRxNNkvZJhLW9iQ0/IoT---Smart-Room?node-id=0-1&t=azezdRRlXeaa6fxi-1" />
                        <ActionButton icon={iconGithub} label="Github" target="_blank" rel="noopener noreferrer" href="https://github.com/hoanglong2534/smart-room-iot" />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
