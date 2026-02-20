import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DateTimeRangePicker } from '@mui/x-date-pickers-pro/DateTimeRangePicker';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';

const Filter = ({
    children,
    dateRange,
    onDateRangeChange,
    onSearch
}) => {
    return (
        <div className="flex flex-wrap gap-[20px] mb-[25px] items-end z-20 relative">
            {children}

            <div className="relative">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div className="flex flex-col gap-[5px]">
                        <label className="text-[0.9rem] font-semibold text-[#727681] mb-[0px]">Tìm theo thời gian</label>
                        <DemoContainer components={['DateTimeRangePicker']} sx={{ paddingTop: 0 }}>
                            <DateTimeRangePicker
                                value={dateRange}
                                onChange={onDateRangeChange}
                                ampm={false}
                                format="dd/MM/yyyy HH:mm:ss"
                                slots={{ field: SingleInputDateRangeField }}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        sx: {
                                            width: 380,
                                            bgcolor: 'white',
                                            '& .MuiOutlinedInput-root': {
                                                height: '40px',
                                                borderRadius: '8px',
                                                borderColor: '#E0E0E0',
                                                '&:hover fieldset': {
                                                    borderColor: '#B08955',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#B08955',
                                                },
                                            }
                                        }
                                    }
                                }}
                            />
                        </DemoContainer>
                    </div>
                </LocalizationProvider>
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
