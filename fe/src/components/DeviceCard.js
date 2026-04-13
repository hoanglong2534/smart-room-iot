import React from 'react';

const DeviceCard = ({
    name,
    isOn,
    isLoading,
    isHardwareOnline = true,
    iconStatic,
    iconGif,
    onClick,
    activeBgClass,
    activeTextClass,
    activeTitleColor
}) => {
    return (
        <div
            className={`p-[15px_10px] rounded-[24px] flex justify-center items-center shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all duration-300 
                ${!isHardwareOnline ? 'opacity-60 grayscale cursor-not-allowed bg-[#EAEAEA]' :
                    isLoading ? 'opacity-70 cursor-not-allowed bg-[#EAEAEA] text-[#727681]' : 'cursor-pointer hover:-translate-y-[5px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)]'}
                ${isHardwareOnline && !isLoading && isOn ? `${activeBgClass} ${activeTextClass} ring-4 ring-white/50` : 'bg-white border border-[#f0f0f0]'}
                ${isHardwareOnline && !isLoading && !isOn ? 'text-[#727681]' : ''}`}
            onClick={!isHardwareOnline || isLoading ? undefined : onClick}
        >
            <div className="block mb-[5px] mx-2 xl:mx-4 2xl:mx-[40px]">
                <span className={`text-[1.2rem] xl:text-[1.4rem] text-center font-bold block ${isHardwareOnline && !isLoading && isOn ? activeTitleColor : ''}`}>{name}</span>
                <h3 className="m-0 text-[1.4rem] xl:text-[1.8rem] 2xl:text-[2.2rem] font-bold whitespace-nowrap">
                    {!isHardwareOnline ? (
                        <div className="text-[1.5rem] text-[#D32F2F] font-bold text-center mt-2">MẤT KẾT NỐI</div>
                    ) : isLoading ? (
                        <div className="flex items-center gap-2 text-[1.5rem] opacity-70">
                            <div className="w-5 h-5 border-4 border-[#888] border-t-transparent rounded-full animate-spin"></div>
                            Vui lòng đợi...
                        </div>
                    ) : (
                        isOn ? 'ĐANG BẬT' : 'ĐANG TẮT'
                    )}
                </h3>
            </div>
            <div className="flex justify-center items-center ml-2 xl:ml-4">
                <img
                    src={isOn && !isLoading && isHardwareOnline ? iconGif : iconStatic}
                    alt={name}
                    className={`w-[60px] h-[60px] xl:w-[80px] xl:h-[80px] 2xl:w-[100px] 2xl:h-[100px] object-contain ${isLoading || !isHardwareOnline ? 'opacity-50 grayscale' : ''}`}
                />
            </div>
        </div>
    );
};

export default DeviceCard;
