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
            className={`p-[10px_1px] rounded-[15px] flex justify-center items-center cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition-transform duration-200 hover:-translate-y-[3px]
                ${isOn ? `${activeBgClass} ${activeTextClass}` : 'bg-[#D9D9D9] text-[#727681]'}`}
            onClick={onClick}
        >
            <div className="block mb-[5px] mx-[40px]">
                <span className={`text-[1.4rem] text-center font-bold block ${isOn ? activeTitleColor : ''}`}>{name}</span>
                <h3 className="m-0 text-[2.4rem] font-bold">{isOn ? 'ĐANG BẬT' : 'ĐANG TẮT'}</h3>
            </div>
            <img
                src={isOn ? iconGif : iconStatic}
                alt={name}
                className="px-0 w-[100px] h-[100px] object-contain"
            />
        </div>
    );
};

export default DeviceCard;
