import React from 'react';
import Table from './Table';
import Pagination from './Pagination';

const DataTable = ({
    columns,
    data,
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    onSort,
    sortConfig
}) => {
    return (
        <div className="flex flex-col gap-[20px]">
            <div className="z-10">
                <Table
                    columns={columns}
                    data={data}
                    onSort={onSort}
                    sortConfig={sortConfig}
                />
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={onItemsPerPageChange}
            />
        </div>
    );
};

export default DataTable;
