import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange }) => {


    const renderPageNumbers = () => {
        const pages = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(renderPageButton(i));
            }
        } else {
            pages.push(renderPageButton(1));

            if (currentPage > 3) {
                pages.push(<span key="dots-1" className="px-2 text-[#999]">...</span>);
            }

            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                endPage = Math.min(totalPages - 1, 4);
            }
            if (currentPage >= totalPages - 2) {
                startPage = Math.max(2, totalPages - 3);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(renderPageButton(i));
            }

            if (currentPage < totalPages - 2) {
                pages.push(<span key="dots-2" className="px-2 text-[#999]">...</span>);
            }

            if (totalPages > 1) {
                pages.push(renderPageButton(totalPages));
            }
        }

        return pages;
    };

    const renderPageButton = (pageNumber) => (
        <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`
                w-[35px] h-[35px] rounded-[8px] flex items-center justify-center text-[0.9rem] font-bold transition-all duration-200
                ${currentPage === pageNumber
                    ? 'bg-[#A1887F] text-white shadow-md'
                    : 'bg-[#E0E0E0] text-[#727681] hover:bg-[#D7CCC8] hover:text-[#5D4037]'}
            `}
        >
            {pageNumber}
        </button>
    );

    return (
        <div className="flex items-center justify-between mt-[30px] select-none flex-wrap gap-[20px]">

            <div className="flex items-center gap-[15px]">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 text-[#999] text-[0.9rem] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:text-[#5D4037] transition-colors"
                >
                    Trang trước
                </button>

                <div className="flex items-center gap-[8px]">
                    {renderPageNumbers()}
                </div>

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 text-[#999] text-[0.9rem] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:text-[#5D4037] transition-colors"
                >
                    Trang sau
                </button>
            </div>

            <div className="flex items-center gap-[10px] ml-auto">
                <span className="text-[#999] text-[0.9rem]">Số hàng một trang</span>
                <select
                    className="h-[35px] bg-[#E0E0E0] rounded-[8px] px-[10px] text-[#333] text-[0.9rem] font-semibold border-none outline-none cursor-pointer focus:ring-2 focus:ring-[#A1887F]"
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange && onItemsPerPageChange(Number(e.target.value))}
                >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
        </div>
    );
};

export default Pagination;
