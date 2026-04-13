import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import Sidebar from '../components/Sidebar';
import DataTable from '../components/DataTable';
import Filter from '../components/Filter';
import statusPending from '../assets/Status.png';
import statusOff from '../assets/Status (1).png';
import statusOn from '../assets/col 6.png';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getActionHistory, getActionHistoryNames } from '../services/api';

dayjs.extend(customParseFormat);

const resolveStompBrokerUrl = () => {
    if (process.env.REACT_APP_STOMP_URL) return process.env.REACT_APP_STOMP_URL;
    try {
        const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:12345/smartroom/api';
        const u = new URL(apiBase);
        const wsScheme = u.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${wsScheme}//${u.host}/smartroom/ws`;
    } catch {
        return 'ws://localhost:12345/smartroom/ws';
    }
};

const History = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialDeviceFilter = searchParams.get('device') || searchParams.get('deviceName') || searchParams.get('deviceId') || 'all';

    const [data, setData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('size')) || 15);
    const [loading, setLoading] = useState(false);
    const [deviceNames, setDeviceNames] = useState([]);
    const [actionOptions, setActionOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);

    const ACTION_LABELS = { ON: 'ON', OFF: 'OFF' };
    const STATUS_LABELS = { ON: 'Đã bật', OFF: 'Đã tắt', PENDING: 'Đang xử lý' };

    const [filterDevice, setFilterDevice] = useState(initialDeviceFilter);
    const [filterAction, setFilterAction] = useState(searchParams.get('action') || 'all');
    const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');

    const initTime = () => {
        const time = searchParams.get('time');
        return time ? dayjs(time, 'HH:mm:ss DD-MM-YYYY') : null;
    };
    const [timeFilter, setTimeFilter] = useState(initTime());

    const [tempFilterDevice, setTempFilterDevice] = useState(initialDeviceFilter);
    const [tempFilterAction, setTempFilterAction] = useState(searchParams.get('action') || 'all');
    const [tempFilterStatus, setTempFilterStatus] = useState(searchParams.get('status') || 'all');
    const [tempTimeFilter, setTempTimeFilter] = useState(initTime());

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'THIẾT BỊ', accessor: 'deviceName', render: (row) => <span className="font-medium">{row.deviceName}</span> },
        { header: 'HÀNH ĐỘNG', accessor: 'action', render: (row) => <span className="font-bold">{row.action}</span> },
        {
            header: 'TRẠNG THÁI',
            accessor: 'status',
            render: (row) => {
                let iconSrc = statusPending;
                const status = typeof row.status === 'string' ? row.status : row.status?.toString?.() || '';
                if (status === 'ON') iconSrc = statusOn;
                else if (status === 'OFF') iconSrc = statusOff;

                return (
                    <div className="flex justify-center">
                        <img
                            src={iconSrc}
                            alt={status}
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
        const fetchActionHistoryNames = async () => {
            try {
                const names = await getActionHistoryNames();
                setDeviceNames(Array.isArray(names) ? names : []);
            } catch (error) {
                console.error('Error fetching action history names', error);
                setDeviceNames([]);
            }
        };

        fetchActionHistoryNames();
    }, []);


    useEffect(() => {
        const params = new URLSearchParams();
        if (currentPage !== 1) params.set('page', currentPage);
        if (itemsPerPage !== 15) params.set('size', itemsPerPage);
        if (filterDevice !== 'all') params.set('device', filterDevice);
        if (filterAction !== 'all') params.set('action', filterAction);
        if (filterStatus !== 'all') params.set('status', filterStatus);
        if (timeFilter) params.set('time', timeFilter.format('HH:mm:ss DD-MM-YYYY'));
        setSearchParams(params, { replace: true });
    }, [currentPage, itemsPerPage, filterDevice, filterAction, filterStatus, timeFilter, setSearchParams]);

    useEffect(() => {
        const fetchData = async (showLoading = true) => {
            if (showLoading) setLoading(true);
            try {
                const params = {
                    page: currentPage - 1,
                    size: itemsPerPage,
                    sortType: sortConfig.direction
                };

                if (filterDevice !== 'all') {
                    params.deviceName = filterDevice;
                }
                if (filterAction !== 'all') {
                    params.action = filterAction;
                }
                if (filterStatus !== 'all') {
                    params.status = filterStatus;
                }

                if (timeFilter) params.time = timeFilter.format('HH:mm:ss DD-MM-YYYY');

                const response = await getActionHistory(params);
                const content = response.content || [];
                setData(content);
                // derive unique action/status values to populate dropdown labels
                const uniqueActions = Array.from(new Set(content.map(r => r.action).filter(Boolean)));
                const uniqueStatuses = Array.from(new Set(content.map(r => (typeof r.status === 'string' ? r.status : r.status?.toString?.())).filter(Boolean)));
                setActionOptions(uniqueActions);
                setStatusOptions(uniqueStatuses);
                const total = response.page ? response.page.totalElements : (response.totalElements || 0);
                setTotalItems(total);
            } catch (error) {
                console.error("Error loading history data", error);
                setData([]);
                setTotalItems(0);
            } finally {
                if (showLoading) setLoading(false);
            }
        };

        fetchData(true);

        // Auto-refresh every 3 seconds to show updated status
        const interval = setInterval(() => fetchData(false), 3000);

        const client = new Client({
            brokerURL: resolveStompBrokerUrl(),
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe('/topic/device-status', () => {
                    fetchData(false);
                });
            }
        });
        client.activate();

        return () => {
            clearInterval(interval);
            if (client.active) {
                client.deactivate();
            }
        };
    }, [currentPage, itemsPerPage, filterDevice, filterAction, filterStatus, timeFilter, sortConfig]);

    const handleSearch = () => {
        setFilterDevice(tempFilterDevice);
        setFilterAction(tempFilterAction);
        setFilterStatus(tempFilterStatus);
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

                    </header>

                    <div className="bg-white rounded-[15px] p-[25px] flex flex-col shadow-sm relative">
                        <Filter
                            timeFilter={tempTimeFilter}
                            onTimeFilterChange={setTempTimeFilter}
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
                                    {deviceNames.map((name, index) => (
                                        <option key={`device-${index}-${name}`} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                                            <div className="flex flex-col gap-[5px]">
                                                    <label className="text-[0.9rem] font-semibold text-[#727681]">Tìm theo hành động</label>
                                                    <select
                                                        className="h-[40px] border border-[#E0E0E0] rounded-[8px] px-[15px] text-[0.9rem] text-[#333] bg-white outline-none focus:border-[#B08955] min-w-[200px]"
                                                        value={tempFilterAction}
                                                        onChange={(e) => setTempFilterAction(e.target.value)}
                                                    >
                                                        <option value="all">Tất cả</option>
                                                        {actionOptions.length ? actionOptions.map((a, i) => (
                                                            <option key={`action-${i}-${a}`} value={a}>{a}</option>
                                                        )) : (
                                                            <>
                                                                <option value="ON">ON</option>
                                                                <option value="OFF">OFF</option>
                                                            </>
                                                        )}
                                                    </select>
                                                </div>
                            <div className="flex flex-col gap-[5px]">
                                <label className="text-[0.9rem] font-semibold text-[#727681]">Tìm theo trạng thái</label>
                                <select
                                    className="h-[40px] border border-[#E0E0E0] rounded-[8px] px-[15px] text-[0.9rem] text-[#333] bg-white outline-none focus:border-[#B08955] min-w-[200px]"
                                    value={tempFilterStatus}
                                    onChange={(e) => setTempFilterStatus(e.target.value)}
                                >
                                    <option value="all">Tất cả</option>
                                    {statusOptions.length ? statusOptions.map((s, i) => (
                                        <option key={`status-${i}-${s}`} value={s}>{STATUS_LABELS[s?.toUpperCase?.() ?? s] || s}</option>
                                    )) : (
                                        <>
                                            <option value="ON">{STATUS_LABELS.ON}</option>
                                            <option value="OFF">{STATUS_LABELS.OFF}</option>
                                            <option value="PENDING">{STATUS_LABELS.PENDING}</option>
                                        </>
                                    )}
                                </select>
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

export default History;
