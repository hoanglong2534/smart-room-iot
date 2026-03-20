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
            className={`p-[10px_1px] rounded-[15px] flex justify-center items-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition-transform duration-200 
                ${!isHardwareOnline ? 'opacity-60 grayscale cursor-not-allowed bg-[#EAEAEA]' : 
                  isLoading ? 'opacity-70 cursor-not-allowed bg-[#EAEAEA] text-[#727681]' : 'cursor-pointer hover:-translate-y-[3px]'}
                ${isHardwareOnline && !isLoading && isOn ? `${activeBgClass} ${activeTextClass}` : ''}
                ${isHardwareOnline && !isLoading && !isOn ? 'bg-[#D9D9D9] text-[#727681]' : ''}`}
            onClick={!isHardwareOnline || isLoading ? undefined : onClick}
        >
            <div className="block mb-[5px] mx-[40px]">
                <span className={`text-[1.4rem] text-center font-bold block ${isHardwareOnline && !isLoading && isOn ? activeTitleColor : ''}`}>{name}</span>
                <h3 className="m-0 text-[2.4rem] font-bold">
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
            <div className="flex justify-center items-center">
                <img
                    src={isOn && !isLoading && isHardwareOnline ? iconGif : iconStatic}
                    alt={name}
                    className={`w-[100px] h-[100px] object-contain ${isLoading || !isHardwareOnline ? 'opacity-50 grayscale' : ''}`}
                />
            </div>
        </div>
    );
};

export default DeviceCard;
