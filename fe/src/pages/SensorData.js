import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import Filter from '../components/Filter';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getSensorData, getSensorsList } from '../services/api';

dayjs.extend(customParseFormat);

const SensorData = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialSensorFilter = searchParams.get('sensor') || searchParams.get('sensorName') || searchParams.get('sensorId') || 'all';

    // State
    const [data, setData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('size')) || 15);
    const [loading, setLoading] = useState(false);
    const [sensors, setSensors] = useState([]);

    // Filter State (Applied)
    const [filterSensor, setFilterSensor] = useState(initialSensorFilter);
    const [filterValue, setFilterValue] = useState(searchParams.get('value') || '');

    const initTime = () => {
        const time = searchParams.get('time');
        return time ? dayjs(time, 'HH:mm:ss DD-MM-YYYY') : null;
    };
    const [timeFilter, setTimeFilter] = useState(initTime());

    // Temporary State (UI)
    const [tempFilterSensor, setTempFilterSensor] = useState(initialSensorFilter);
    const [tempFilterValue, setTempFilterValue] = useState(searchParams.get('value') || '');
    const [tempTimeFilter, setTempTimeFilter] = useState(initTime());

    const getSensorOption = (sensor, index) => {
        if (typeof sensor === 'string') {
            return {
                key: `sensor-${index}-${sensor}`,
                value: sensor,
                label: sensor,
            };
        }

        const name = sensor?.name || '';
        const id = sensor?.id;
        const fallback = name || String(id || '');

        return {
            key: id ?? `sensor-${index}-${fallback}`,
            value: name || String(id || ''),
            label: fallback,
        };
    };

    // Columns Configuration
    const columns = [
        { header: 'ID', accessor: 'id' },
        {
            header: 'CẢM BIẾN',
            accessor: 'name',
            render: (row) => <span className="font-medium">{row.name || ''}</span>
        },
        { 
            header: 'GIÁ TRỊ CẢM BIẾN', 
            accessor: 'value', 
            render: (row) => {
                const name = row.name || '';
                let unit = '';
                if (name.includes('nhiệt độ')) unit = '°C';
                if (name.includes('độ ẩm')) unit = '%';
                if (name.includes('ánh sáng')) unit = 'lx';
                if (name.includes('bụi')) unit = ' µg/m³';
                return <span className="font-bold text-[#333]">{row.value}{unit}</span>;
            }
        },
        {
            header: 'THỜI GIAN',
            accessor: 'time',
            render: (row) => row.from ? dayjs(row.from).format('HH:mm:ss DD/MM/YYYY') : ''
        },
    ];

    const [sortConfig, setSortConfig] = useState({ key: 'rawTime', direction: 'desc' });

    useEffect(() => {
        const fetchSensors = async () => {
            try {
                const list = await getSensorsList();
                setSensors(list || []);
            } catch (error) {
                console.error("Error fetching sensors list", error);
            }
        };
        fetchSensors();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();
        if (currentPage !== 1) params.set('page', currentPage);
        if (itemsPerPage !== 15) params.set('size', itemsPerPage);
        if (filterSensor !== 'all') params.set('sensor', filterSensor);
        if (filterValue) params.set('value', filterValue);
        if (timeFilter) params.set('time', timeFilter.format('HH:mm:ss DD-MM-YYYY'));
        setSearchParams(params, { replace: true });
    }, [currentPage, itemsPerPage, filterSensor, filterValue, timeFilter, setSearchParams]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = {
                    page: currentPage - 1,
                    size: itemsPerPage,
                    sortType: sortConfig.direction
                };

                if (filterSensor !== 'all') {
                    params.sensorName = filterSensor;
                }

                if (filterValue) {
                    const parsedValue = parseFloat(filterValue);
                    if (!isNaN(parsedValue)) {
                        params.value = parsedValue;
                    }
                }

                if (timeFilter) params.time = timeFilter.format('HH:mm:ss DD-MM-YYYY');

                const response = await getSensorData(params);
                setData(response.content || []);
                const total = response.page ? response.page.totalElements : (response.totalElements || 0);
                setTotalItems(total);
            } catch (error) {
                console.error("Error loading sensor data", error);
                setData([]);
                setTotalItems(0);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, itemsPerPage, filterSensor, filterValue, timeFilter, sortConfig]);

    const handleSearch = () => {
        setFilterSensor(tempFilterSensor);
        setFilterValue(tempFilterValue);
        setTimeFilter(tempTimeFilter);
        setCurrentPage(1);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="flex h-screen bg-bg-secondary font-sans text-text-title">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-y-auto">
                <div className="w-full min-h-full p-[20px_40px] flex flex-col">
                    <header className="mb-[30px] flex items-center justify-between">
                        {/* Header placeholder */}
                    </header>

                    <div className="bg-white rounded-[15px] p-[25px] flex flex-col shadow-sm relative">
                        <Filter
                            timeFilter={tempTimeFilter}
                            onTimeFilterChange={setTempTimeFilter}
                            onSearch={handleSearch}
                        >
                            <div className="flex flex-col gap-[5px]">
                                <label className="text-[0.9rem] font-semibold text-[#727681]">Tìm theo tên cảm biến</label>
                                <select
                                    className="h-[40px] border border-[#E0E0E0] rounded-[8px] px-[15px] text-[0.9rem] text-[#333] bg-white outline-none focus:border-[#B08955] min-w-[200px]"
                                    value={tempFilterSensor}
                                    onChange={(e) => {
                                        setTempFilterSensor(e.target.value);
                                        if (e.target.value === 'all') setTempFilterValue('');
                                    }}
                                >
                                    <option value="all">Tất cả</option>
                                    {sensors.map((s, index) => {
                                        const option = getSensorOption(s, index);
                                        return (
                                        <option key={option.key} value={option.value}>
                                            {option.label}
                                        </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="flex flex-col gap-[5px]">
                                <label className="text-[0.9rem] font-semibold text-[#727681]">Tìm theo giá trị cảm biến</label>
                                <input
                                    type="text"
                                    placeholder="Nhập giá trị..."
                                    className={`
                                        h-[40px] border border-[#E0E0E0] rounded-[8px] px-[15px] text-[0.9rem] outline-none min-w-[200px] transition-colors
                                        ${tempFilterSensor === 'all'
                                            ? 'bg-[#F5F5F5] text-[#999] cursor-not-allowed'
                                            : 'bg-white text-[#333] focus:border-[#B08955]'}
                                    `}
                                    value={tempFilterValue}
                                    onChange={(e) => setTempFilterValue(e.target.value)}
                                    disabled={tempFilterSensor === 'all'}
                                />
                            </div>
                        </Filter>

                        <div className="relative">
                            {loading && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-[15px] transition-all duration-[2000ms]">
                                    <div className="flex flex-col items-center gap-[10px]">
                                        <div className="w-[30px] h-[30px] border-4 border-[#B08955] border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-[0.9rem] font-medium text-[#727681]">Đang cập nhật...</span>
                                    </div>
                                </div>
                            )}

                            <div className={`transition-opacity duration-[2000ms] ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                <DataTable
                                    columns={columns}
                                    data={data}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    itemsPerPage={itemsPerPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                    onSort={handleSort}
                                    sortConfig={sortConfig}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SensorData;
