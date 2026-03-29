import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const DISPLAY_FORMAT = 'HH:mm:ss DD/MM/YYYY';

const Filter = ({
    children,
    dateRange,
    onDateRangeChange,
    onSearch
}) => {
    const parseFormats = useMemo(() => ['HH:mm:ss DD/MM/YYYY'], []);

    const [fromText, setFromText] = useState('');
    const [toText, setToText] = useState('');

    useEffect(() => {
        setFromText(dateRange?.[0] ? dayjs(dateRange[0]).format(DISPLAY_FORMAT) : '');
        setToText(dateRange?.[1] ? dayjs(dateRange[1]).format(DISPLAY_FORMAT) : '');
    }, [dateRange]);

    const tryParse = (value) => {
        const v = (value || '').trim();
        if (!v) return null;
        const parsed = dayjs(v, parseFormats, true);
        return parsed.isValid() ? parsed : null;
    };

    const onFromChange = (e) => {
        const value = e.target.value;
        setFromText(value);
        const nextFrom = tryParse(value);
        const nextTo = dateRange?.[1] ?? null;
        if (nextFrom || value.trim() === '') {
            onDateRangeChange([nextFrom, nextTo]);
        }
    };

    const onToChange = (e) => {
        const value = e.target.value;
        setToText(value);
        const nextFrom = dateRange?.[0] ?? null;
        const nextTo = tryParse(value);
        if (nextTo || value.trim() === '') {
            onDateRangeChange([nextFrom, nextTo]);
        }
    };

    const onFromBlur = () => {
        const parsed = tryParse(fromText);
        if (parsed) setFromText(parsed.format(DISPLAY_FORMAT));
    };

    const onToBlur = () => {
        const parsed = tryParse(toText);
        if (parsed) setToText(parsed.format(DISPLAY_FORMAT));
    };

    return (
        <div className="flex flex-wrap gap-[20px] mb-[25px] items-end z-20 relative">
            {children}

            <div className="relative">
                <div className="flex flex-col gap-[5px]">
                    <label className="text-[0.9rem] font-semibold text-[#727681] mb-[0px]">Tìm theo thời gian</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={fromText}
                            onChange={onFromChange}
                            onBlur={onFromBlur}
                            placeholder="Từ: HH:mm:ss DD/MM/YYYY"
                            className="h-[40px] w-[240px] border border-[#E0E0E0] rounded-[8px] px-[10px] text-[0.9rem] placeholder:text-[0.82rem] text-[#333] bg-white outline-none focus:border-[#B08955]"
                        />
                        <span className="text-[#727681]">→</span>
                        <input
                            type="text"
                            value={toText}
                            onChange={onToChange}
                            onBlur={onToBlur}
                            placeholder="Đến: HH:mm:ss DD/MM/YYYY"
                            className="h-[40px] w-[240px] border border-[#E0E0E0] rounded-[8px] px-[10px] text-[0.9rem] placeholder:text-[0.82rem] text-[#333] bg-white outline-none focus:border-[#B08955]"
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
