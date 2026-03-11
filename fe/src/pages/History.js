import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import Filter from '../components/Filter';
import statusPending from '../assets/Status.png';
import statusOff from '../assets/Status (1).png';
import statusOn from '../assets/col 6.png';
import dayjs from 'dayjs';
import { getActionHistory } from '../services/api';

const History = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [data, setData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('size')) || 15);
    const [loading, setLoading] = useState(false);

    const [filterDevice, setFilterDevice] = useState(searchParams.get('device') || 'all');

    const initDateRange = () => {
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        if (from && to) return [dayjs(from), dayjs(to)];
        return [dayjs().startOf('month'), dayjs().endOf('month')];
    };
    const [dateRange, setDateRange] = useState(initDateRange());

    const [tempFilterDevice, setTempFilterDevice] = useState(searchParams.get('device') || 'all');
    const [tempDateRange, setTempDateRange] = useState(initDateRange());

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'THIẾT BỊ', accessor: 'deviceName', render: (row) => <span className="font-medium">{row.deviceName}</span> },
        { header: 'HÀNH ĐỘNG', accessor: 'action', render: (row) => <span className="font-bold">{row.action}</span> },
        {
            header: 'TRẠNG THÁI',
            accessor: 'status',
            render: (row) => {
                let iconSrc = statusPending;
                if (row.status === 'ON') iconSrc = statusOn;
                else if (row.status === 'OFF') iconSrc = statusOff;

                return (
                    <div className="flex justify-center">
                        <img
                            src={iconSrc}
                            alt={row.status}
                            className="h-[25px] object-contain"
                        />
                    </div>
                );
            }
        },
        {
            header: 'THỜI GIAN',
            accessor: 'time',
            render: (row) => row.time ? dayjs(row.time).format('HH:mm:ss DD/MM/YYYY') : ''
        },
    ];

    const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });


    useEffect(() => {
        const params = new URLSearchParams();
        if (currentPage !== 1) params.set('page', currentPage);
        if (itemsPerPage !== 15) params.set('size', itemsPerPage);
        if (filterDevice !== 'all') params.set('device', filterDevice);
        if (dateRange[0] && dateRange[1]) {
            params.set('from', dateRange[0].format('YYYY-MM-DDTHH:mm:ss'));
            params.set('to', dateRange[1].format('YYYY-MM-DDTHH:mm:ss'));
        }
        setSearchParams(params, { replace: true });
    }, [currentPage, itemsPerPage, filterDevice, dateRange, setSearchParams]);

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
                    params.from = dateRange[0].format('YYYY-MM-DDTHH:mm:ss');
                    params.to = dateRange[1].format('YYYY-MM-DDTHH:mm:ss');
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
