import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const DISPLAY_FORMAT = 'HH:mm:ss DD/MM/YYYY';

const Filter = ({
    children,
    timeFilter,
    onTimeFilterChange,
    onSearch
}) => {
    const parseFormats = useMemo(() => ['HH:mm:ss DD/MM/YYYY'], []);

    const [timeText, setTimeText] = useState('');

    useEffect(() => {
        setTimeText(timeFilter ? dayjs(timeFilter).format(DISPLAY_FORMAT) : '');
    }, [timeFilter]);

    const tryParse = (value) => {
        const v = (value || '').trim();
        if (!v) return null;
        const parsed = dayjs(v, parseFormats, true);
        return parsed.isValid() ? parsed : null;
    };

    const onTimeChange = (e) => {
        const value = e.target.value;
        setTimeText(value);
        const next = tryParse(value);
        if (next || value.trim() === '') {
            onTimeFilterChange(next);
        }
    };

    const onTimeBlur = () => {
        const parsed = tryParse(timeText);
        if (parsed) setTimeText(parsed.format(DISPLAY_FORMAT));
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
                            value={timeText}
                            onChange={onTimeChange}
                            onBlur={onTimeBlur}
                            placeholder="HH:mm:ss DD/MM/YYYY"
                            className="h-[40px] w-[320px] border border-[#E0E0E0] rounded-[8px] px-[10px] text-[0.9rem] placeholder:text-[0.82rem] text-[#333] bg-white outline-none focus:border-[#B08955]"
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
