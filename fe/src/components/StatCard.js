import React from 'react';

const StatCard = ({
    title,
    icon,
    value,
    trendIcon,
    trendText,
    isActive,
    onClick,
    bgClass,
    textClass
}) => {
    return (
        <div
            className={`rounded-[15px] p-[25px] flex flex-col justify-between cursor-pointer transition-all duration-300
                ${isActive
                    ? 'shadow-[0_10px_20px_rgba(0,0,0,0.1)] -translate-y-[10px]'
                    : 'shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:-translate-y-[3px]'} 
                ${bgClass}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-center mb-[15px]">
                <span className="text-[#727681] font-bold text-[1.1rem] tracking-[1px] uppercase">{title}</span>
                <img src={icon} alt={title} className="w-[45px] h-[45px] object-contain" />
            </div>
            <div className="flex items-center gap-[15px]">
                <h1 className={`text-[5.5rem] m-0 font-semibold ${textClass}`}>{value}</h1>
                <img src={trendIcon} alt="Trend" className="w-[60px] h-[60px] object-contain" />
            </div>
            <p className="text-[#727681] text-[1rem] mt-[10px]">{trendText}</p>
        </div>
    );
};

export default StatCard;
