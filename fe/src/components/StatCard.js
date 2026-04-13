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
    textClass,
    style,
    compactItems
}) => {
    return (
        <div
            className={`relative p-[25px] flex flex-col justify-between cursor-pointer transition-all duration-300 rounded-[15px] border border-[#f0f0f0] overflow-hidden h-full
                ${isActive
                    ? 'shadow-[0_10px_20px_rgba(0,0,0,0.08)] -translate-y-[8px] border-brand'
                    : 'shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:-translate-y-[3px] hover:shadow-[0_8px_15px_rgba(0,0,0,0.06)]'} 
                ${bgClass}`}
            onClick={onClick}
        >
            {/* Fill Overlay */}
            <div 
                className="absolute bottom-0 left-0 right-0 z-0 transition-all duration-1000 ease-in-out" 
                style={style}
            />

            <div className="relative z-10 flex-1 flex flex-col justify-between">
                {compactItems && Array.isArray(compactItems) ? (
                    // Nicely formatted mini-stats for the "All" card
                    <div className="flex flex-col gap-3 flex-1 justify-center">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[#727681] opacity-[0.85] font-semibold text-[1.6rem] uppercase">{title}</span>
                            {icon ? <img src={icon} alt={title} className="w-[36px] h-[30px] object-contain opacity-90" /> : null}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f0f0f0]">
                            {compactItems.map(item => (
                                <div key={item.key} className="bg-[#fcfcfc] rounded-[10px] p-2 flex flex-col items-center justify-center text-center border border-[#f5f5f5]">
                                    <div className="text-[1.3rem] font-bold text-[#333] mb-0.5">{item.value}</div>
                                    <div className="text-[0.65rem] text-[#9a9a9a] font-medium uppercase tracking-tighter whitespace-nowrap">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-[15px]">
                            <span className="text-[#727681] opacity-[0.7] font-semibold text-[1.4rem] tracking-[1px] uppercase whitespace-nowrap">{title}</span>
                            <img src={icon} alt={title} className="w-[60px] h-[40px] object-contain" />
                        </div>
                        <div className="flex items-center gap-[15px]">
                            <h1 className={`text-[5.5rem] m-0 font-bold ${textClass} min-w-0 flex-1 break-words`}>
                                {value}
                            </h1>
                            <img src={trendIcon} alt="Trend" className="w-[48px] h-[48px] object-contain flex-shrink-0" />
                        </div>
                       <i> <p className="text-[#727681] text-[1.5rem] mt-[10px]">{trendText}</p></i>
                    </>
                )}
            </div>
        </div>
    );
};

export default StatCard;
