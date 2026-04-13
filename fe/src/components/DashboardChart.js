import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend
} from 'recharts';

const DashboardChart = ({ data, type = 'humidifier' }) => {
    // Define colors based on the type
    const getColors = (type) => {
        switch (type) {
            case 'humidifier':
                return {
                    stroke: '#5BD4D4',
                    fillStart: '#5BD4D4',
                    fillEnd: '#E8F2F1',
                    point: '#5BD4D4'
                };
            case 'light':
                return {
                    stroke: '#FFB300',
                    fillStart: '#FFB300',
                    fillEnd: '#FFF4D6',
                    point: '#FFB300'
                };
            case 'fan':
                return {
                    stroke: '#F44336',
                    fillStart: '#F44336',
                    fillEnd: '#FCE8E6',
                    point: '#F44336'
                };
            case 'dust':
                return {
                    stroke: '#9E9E9E',
                    fillStart: '#9E9E9E',
                    fillEnd: '#F5F5F5',
                    point: '#9E9E9E'
                };
            default:
                return {
                    stroke: '#4DD0E1',
                    fillStart: '#4DD0E1',
                    fillEnd: '#E0F7FA',
                    point: '#4DD0E1'
                };
        }
    };

    const colors = getColors(type);

    // Custom Tooltip (supports multi-line payloads)
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
                    <p className="text-sm font-semibold">{`Time: ${label}`}</p>
                    {payload.map((p, idx) => (
                        <p key={idx} className="text-sm" style={{ color: p.stroke || p.color || '#333' }}>
                            {`${p.name}: ${p.value ?? '-'}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (type === 'all') {
        // Combine all data into one array for multi-line chart
        const allData = {};
        if (data) {
            ['temperature', 'humidity', 'light', 'dust'].forEach(key => {
                const arr = data[key] || [];
                if (Array.isArray(arr)) {
                    arr.forEach(item => {
                        if (!item) return;
                        const time = item.time || item.label || item.t || '';
                        if (!allData[time]) {
                            allData[time] = { time };
                        }
                        allData[time][key] = Number(item.value ?? item.v ?? 0);
                    });
                }
            });
        }
        const chartData = Object.values(allData).sort((a, b) => (a.time > b.time ? 1 : -1));

        // compute dynamic Y range so large values (e.g., lux) won't crush other lines
        let maxVal = 100;
        if (chartData.length) {
            maxVal = Math.max(...chartData.map(d => Math.max(d.temperature || 0, d.humidity || 0, d.light || 0, d.dust || 0)));
            maxVal = Math.ceil(maxVal * 1.1) || 100;
        }
        const ticks = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

        return (
            <div className="w-full h-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid vertical={false} stroke="#E0E0E0" strokeDasharray="3 3" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={true}
                            tick={{ fill: '#9E9E9E', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={true}
                            tick={{ fill: '#9E9E9E', fontSize: 12 }}
                            domain={[0, maxVal]}
                            ticks={ticks}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="temperature" name="Nhiệt độ" stroke="#f44336" dot={false} />
                        <Line type="monotone" dataKey="humidity" name="Độ ẩm" stroke="#5bd4d4" dot={false} />
                        <Line type="monotone" dataKey="light" name="Ánh sáng" stroke="#fbc02d" dot={false} />
                        <Line type="monotone" dataKey="dust" name="Độ bụi" stroke="#9e9e9e" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    }

    let strokeColor = "#8884d8";
    let fillColor = "#8884d8";

    switch (type) {
        case 'humidifier':
            strokeColor = '#5BD4D4';
            fillColor = 'url(#colorGradient-humidifier)';
            break;
        case 'light':
            strokeColor = '#FFB300';
            fillColor = 'url(#colorGradient-light)';
            break;
        case 'fan':
            strokeColor = '#F44336';
            fillColor = 'url(#colorGradient-fan)';
            break;
        case 'dust':
            strokeColor = '#9E9E9E';
            fillColor = 'url(#colorGradient-dust)';
            break;
        default:
            strokeColor = '#4DD0E1';
            fillColor = 'url(#colorGradient-default)';
    }

    return (
        <div className="w-full h-full min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id={`colorGradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.fillStart} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={colors.fillEnd} stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#E0E0E0" strokeDasharray="3 3" />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={true}
                        tick={{ fill: '#9E9E9E', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={true}
                        tick={{ fill: '#9E9E9E', fontSize: 12 }}
                        domain={[0, type === 'light' ? 1000 : (type === 'dust' ? 300 : 100)]}
                        ticks={type === 'light' ? [0, 250, 500, 750, 1000] : (type === 'dust' ? [0, 75, 150, 225, 300] : [0, 25, 50, 75, 100])}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={colors.stroke}
                        strokeWidth={2}
                        fill={`url(#colorGradient-${type})`}
                        dot={{ r: 6, fill: colors.point, strokeWidth: 0 }}
                        activeDot={{ r: 8 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DashboardChart;
