import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import Filter from '../components/Filter';
import dayjs from 'dayjs';
import { getSensorData } from '../services/api';

const SensorData = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [data, setData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('size')) || 15);
    const [loading, setLoading] = useState(false);

    // Filter State (Applied)
    const [filterSensor, setFilterSensor] = useState(searchParams.get('sensor') || 'all');
    const [filterValue, setFilterValue] = useState(searchParams.get('value') || '');

    const initDateRange = () => {
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        if (from && to) return [dayjs(from), dayjs(to)];
        return [dayjs().startOf('month'), dayjs().endOf('month')];
    };
    const [dateRange, setDateRange] = useState(initDateRange());

    // Temporary State (UI)
    const [tempFilterSensor, setTempFilterSensor] = useState(searchParams.get('sensor') || 'all');
    const [tempFilterValue, setTempFilterValue] = useState(searchParams.get('value') || '');
    const [tempDateRange, setTempDateRange] = useState(initDateRange());

    // Columns Configuration
    const columns = [
        { header: 'ID', accessor: 'id' },
        {
            header: 'CẢM BIẾN',
            accessor: 'name',
            render: (row) => {
                const displayNames = {
                    'Humidity': 'Cảm biến độ ẩm',
                    'Temperature': 'Cảm biến nhiệt độ',
                    'Light': 'Cảm biến ánh sáng'
                };
                return <span className="font-medium">{displayNames[row.name] || row.name}</span>;
            }
        },
        { header: 'GIÁ TRỊ CẢM BIẾN', accessor: 'value', render: (row) => <span className="font-bold text-[#333]">{row.value}</span> },
        {
            header: 'THỜI GIAN',
            accessor: 'time',
            render: (row) => row.from ? dayjs(row.from).format('HH:mm:ss DD/MM/YYYY') : ''
        },
    ];

    // Sorting State
    const [sortConfig, setSortConfig] = useState({ key: 'rawTime', direction: 'desc' });

    useEffect(() => {
        const params = new URLSearchParams();
        if (currentPage !== 1) params.set('page', currentPage);
        if (itemsPerPage !== 15) params.set('size', itemsPerPage);
        if (filterSensor !== 'all') params.set('sensor', filterSensor);
        if (filterValue) params.set('value', filterValue);
        if (dateRange[0] && dateRange[1]) {
            params.set('from', dateRange[0].format('YYYY-MM-DDTHH:mm:ss'));
            params.set('to', dateRange[1].format('YYYY-MM-DDTHH:mm:ss'));
        }
        setSearchParams(params, { replace: true });
    }, [currentPage, itemsPerPage, filterSensor, filterValue, dateRange, setSearchParams]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = {
                    page: currentPage - 1,
                    size: itemsPerPage,
                    sortType: 'desc'
                };

                if (filterSensor !== 'all') {
                    const nameMap = {
                        'humidity': 'Humidity',
                        'temperature': 'Temperature',
                        'light': 'Light'
                    };
                    params.name = nameMap[filterSensor] || filterSensor;
                }

                if (filterValue) {
                    const parsedValue = parseInt(filterValue);
                    if (!isNaN(parsedValue)) {
                        params.value = parsedValue;
                    }
                }

                if (dateRange[0] && dateRange[1]) {
                    params.from = dateRange[0].format('YYYY-MM-DDTHH:mm:ss');
                    params.to = dateRange[1].format('YYYY-MM-DDTHH:mm:ss');
                }

                const response = await getSensorData(params);
                setData(response.content || []);
                setTotalItems(response.totalElements || 0);
            } catch (error) {
                console.error("Error loading sensor data", error);
                setData([]);
                setTotalItems(0);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, itemsPerPage, filterSensor, filterValue, dateRange, sortConfig]);

    const handleSearch = () => {
        setFilterSensor(tempFilterSensor);
        setFilterValue(tempFilterValue);
        setDateRange(tempDateRange);
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
                            dateRange={tempDateRange}
                            onDateRangeChange={setTempDateRange}
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
                                    <option value="humidity">Cảm biến độ ẩm</option>
                                    <option value="temperature">Cảm biến nhiệt độ</option>
                                    <option value="light">Cảm biến ánh sáng</option>
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

                        {loading ? (
                            <div className="flex justify-center items-center py-10">Đang tải...</div>
                        ) : (
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
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SensorData;
