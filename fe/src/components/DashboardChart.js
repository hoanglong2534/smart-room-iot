import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const DashboardChart = ({ data, type = 'humidifier' }) => {
    // Define colors based on the type
    const getColors = (type) => {
        switch (type) {
            case 'humidifier':
                return {
                    stroke: '#4DD0E1', // Cyan-like
                    fillStart: '#4DD0E1',
                    fillEnd: '#E0F7FA',
                    point: '#4DD0E1'
                };
            case 'light':
                return {
                    stroke: '#FDD835', // Yellow
                    fillStart: '#FDD835',
                    fillEnd: '#FFF9C4',
                    point: '#FDD835'
                };
            case 'fan':
                return {
                    stroke: '#E91E63', // Pink/Red
                    fillStart: '#E91E63',
                    fillEnd: '#FCE4EC',
                    point: '#E91E63'
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

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
                    <p className="text-sm font-semibold">{`Time: ${label}`}</p>
                    <p className="text-sm" style={{ color: colors.stroke }}>
                        {`Value: ${payload[0].value}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full min-h-[300px]">
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
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
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
