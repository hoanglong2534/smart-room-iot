import React from 'react';
import sortIcon from '../assets/sort icon.png';

const Table = ({ columns, data, onSort, sortConfig }) => {
    return (
        <div className="rounded-t-[10px] shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
            <table className="min-w-full border-collapse bg-white text-left text-[0.9rem]">
                <thead>
                    <tr className="bg-[#8C6A3F] text-white">
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className={`
                                    sticky top-0 z-50 bg-[#8C6A3F] p-[15px_20px] font-semibold uppercase tracking-wider text-[0.85rem] border-b border-[#EFEBE9] text-center select-none
                                    ${col.accessor === 'time' ? 'cursor-pointer transition-colors' : ''}
                                `}
                                onClick={() => col.accessor === 'time' && onSort && onSort('rawTime')}
                            >
                                <div className="flex items-center justify-center gap-[8px]">
                                    {col.header}
                                    {col.accessor === 'time' && (
                                        <img
                                            src={sortIcon}
                                            alt="Sort"
                                            title={sortConfig?.key === 'rawTime' ? (sortConfig.direction === 'desc' ? 'Mới nhất' : 'Cũ nhất') : 'Sắp xếp theo thời gian'}
                                            className="w-[20px] h-[20px] object-contain"
                                        />
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-[#333]">
                    {data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={`
                                    border-b border-[#EFEBE9] transition-colors duration-150
                                    ${rowIndex % 2 === 0 ? 'bg-[#EFE9D9]' : 'bg-[#FDFBF7]'}
                                    hover:bg-[rgba(140,106,63,0.1)]
                                `}
                            >
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="p-[15px_20px] align-middle text-center">
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="p-[30px] text-center text-[#999] italic">
                                Không có dữ liệu
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
