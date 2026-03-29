import React from 'react';
import dayjs from 'dayjs';

const Filter = ({
    children,
    dateRange,
    onDateRangeChange,
    onSearch
}) => {
    const fromValue = dateRange?.[0] ? dayjs(dateRange[0]).format('YYYY-MM-DDTHH:mm:ss') : '';
    const toValue = dateRange?.[1] ? dayjs(dateRange[1]).format('YYYY-MM-DDTHH:mm:ss') : '';

    const onFromChange = (e) => {
        const nextFrom = e.target.value ? dayjs(e.target.value) : null;
        const nextTo = dateRange?.[1] ?? null;
        onDateRangeChange([nextFrom, nextTo]);
    };

    const onToChange = (e) => {
        const nextFrom = dateRange?.[0] ?? null;
        const nextTo = e.target.value ? dayjs(e.target.value) : null;
        onDateRangeChange([nextFrom, nextTo]);
    };

    return (
        <div className="flex flex-wrap gap-[20px] mb-[25px] items-end z-20 relative">
            {children}

            <div className="relative">
                <div className="flex flex-col gap-[5px]">
                    <label className="text-[0.9rem] font-semibold text-[#727681] mb-[0px]">Tìm theo thời gian</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="datetime-local"
                            value={fromValue}
                            onChange={onFromChange}
                            step="1"
                            className="h-[40px] border border-[#E0E0E0] rounded-[8px] px-[10px] text-[0.9rem] text-[#333] bg-white outline-none focus:border-[#B08955]"
                        />
                        <span className="text-[#727681]">→</span>
                        <input
                            type="datetime-local"
                            value={toValue}
                            onChange={onToChange}
                            step="1"
                            className="h-[40px] border border-[#E0E0E0] rounded-[8px] px-[10px] text-[0.9rem] text-[#333] bg-white outline-none focus:border-[#B08955]"
                        />
                    </div>
                </div>
            </div>

            <button
                className="h-[40px] px-[25px] bg-[#424242] text-white rounded-[8px] font-semibold text-[0.9rem] hover:bg-[#333] transition-colors ml-auto"
                onClick={onSearch}
            >
                Tìm kiếm
            </button>
        </div>
    );
};

export default Filter;
