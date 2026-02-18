import React from 'react';

const DeviceCard = ({
    name,
    isOn,
    iconStatic,
    iconGif,
    onClick,
    activeBgClass,
    activeTextClass,
    activeTitleColor
}) => {
    return (
        <div
            className={`p-[25px_30px] rounded-[15px] flex justify-between items-center cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition-transform duration-200 hover:-translate-y-[3px]
                ${isOn ? `${activeBgClass} ${activeTextClass}` : 'bg-[#D9D9D9] text-[#727681]'}`}
            onClick={onClick}
        >
            <div className="block mb-[5px]">
                <span className={`text-[1rem] font-bold block mb-[5px] ${isOn ? activeTitleColor : ''}`}>{name}</span>
                <h3 className="m-0 text-[1.4rem]">{isOn ? 'ĐANG BẬT' : 'ĐANG TẮT'}</h3>
            </div>
            <img
                src={isOn ? iconGif : iconStatic}
                alt={name}
                className="w-[70px] h-[70px] object-contain"
            />
        </div>
    );
};

export default DeviceCard;
