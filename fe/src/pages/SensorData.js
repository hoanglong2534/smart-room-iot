import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import Filter from '../components/Filter';
import dayjs from 'dayjs';
import { getSensorData } from '../services/api';

const SensorData = () => {
    // State
    const [data, setData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [loading, setLoading] = useState(false);

    // Filter State (Applied)
    const [filterSensor, setFilterSensor] = useState('all');
    const [filterValue, setFilterValue] = useState('');
    const [dateRange, setDateRange] = useState([
        dayjs('2026-01-01'),
        dayjs('2026-01-31')
    ]);

    // Temporary State (UI)
    const [tempFilterSensor, setTempFilterSensor] = useState('all');
    const [tempFilterValue, setTempFilterValue] = useState('');
    const [tempDateRange, setTempDateRange] = useState([
        dayjs('2026-01-01'),
        dayjs('2026-01-31')
    ]);

    // Columns Configuration
    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'CẢM BIẾN', accessor: 'name', render: (row) => <span className="font-medium">{row.name}</span> },
        { header: 'GIÁ TRỊ CẢM BIẾN', accessor: 'value', render: (row) => <span className="font-bold text-[#333]">{row.value}</span> },
        {
            header: 'THỜI GIAN',
            accessor: 'time',
            render: (row) => row.from ? dayjs(row.from).format('HH:mm:ss DD/MM/YYYY') : ''
        },
    ];

    // Sorting State
    const [sortConfig, setSortConfig] = useState({ key: 'rawTime', direction: 'desc' });

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
                        'humidity': 'Cảm biến độ ẩm',
                        'temperature': 'Cảm biến nhiệt độ',
                        'light': 'Cảm biến ánh sáng'
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
                    params.from = dateRange[0].toISOString();
                    params.to = dateRange[1].toISOString();
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
