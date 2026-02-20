import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import Filter from '../components/Filter';
import statusSuccess from '../assets/Status.png';
import statusFailed from '../assets/Status (1).png';
import dayjs from 'dayjs';
import { getActionHistory } from '../services/api';

const History = () => {

    const [data, setData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [loading, setLoading] = useState(false);

    const [filterDevice, setFilterDevice] = useState('all');
    const [dateRange, setDateRange] = useState([
        dayjs('2026-01-01'),
        dayjs('2026-01-31')
    ]);


    const [tempFilterDevice, setTempFilterDevice] = useState('all');
    const [tempDateRange, setTempDateRange] = useState([
        dayjs('2026-01-01'),
        dayjs('2026-01-31')
    ]);

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'THIẾT BỊ', accessor: 'deviceName', render: (row) => <span className="font-medium">{row.deviceName}</span> },
        { header: 'HÀNH ĐỘNG', accessor: 'action', render: (row) => <span className="font-bold">{row.action}</span> },
        {
            header: 'TRẠNG THÁI',
            accessor: 'status',
            render: (row) => (
                <div className="flex justify-center">
                    <img
                        src={row.status === 'SUCCESS' || row.status === 'success' ? statusSuccess : statusFailed}
                        alt={row.status}
                        className="h-[25px] object-contain"
                    />
                </div>
            )
        },
        {
            header: 'THỜI GIAN',
            accessor: 'time',
            render: (row) => row.time ? dayjs(row.time).format('HH:mm:ss DD/MM/YYYY') : ''
        },
    ];

    const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = {
                    page: currentPage - 1,
                    size: itemsPerPage,
                    sortType: 'desc'
                };

                if (filterDevice !== 'all') {
                    params.deviceName = filterDevice;
                }

                if (dateRange[0] && dateRange[1]) {
                    params.from = dateRange[0].toISOString();
                    params.to = dateRange[1].toISOString();
                }

                const response = await getActionHistory(params);
                setData(response.content || []);
                setTotalItems(response.totalElements || 0);
            } catch (error) {
                console.error("Error loading history data", error);
                setData([]);
                setTotalItems(0);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, itemsPerPage, filterDevice, dateRange, sortConfig]);

    const handleSearch = () => {
        setFilterDevice(tempFilterDevice);
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

                    </header>

                    <div className="bg-white rounded-[15px] p-[25px] flex flex-col shadow-sm relative">
                        <Filter
                            dateRange={tempDateRange}
                            onDateRangeChange={setTempDateRange}
                            onSearch={handleSearch}
                        >
                            <div className="flex flex-col gap-[5px]">
                                <label className="text-[0.9rem] font-semibold text-[#727681]">Tìm theo tên thiết bị</label>
                                <select
                                    className="h-[40px] border border-[#E0E0E0] rounded-[8px] px-[15px] text-[0.9rem] text-[#333] bg-white outline-none focus:border-[#B08955] min-w-[200px]"
                                    value={tempFilterDevice}
                                    onChange={(e) => setTempFilterDevice(e.target.value)}
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="Máy hút ẩm">Máy hút ẩm</option>
                                    <option value="Đèn">Đèn</option>
                                    <option value="Quạt">Quạt</option>
                                </select>
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

export default History;
