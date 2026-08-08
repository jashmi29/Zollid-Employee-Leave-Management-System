import React from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  onItemsPerPageChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  pageSizeOptions = [5, 10, 20, 50]
}) => {
  const { isDark } = useTheme();

  if (totalItems === 0 || totalPages <= 1) {
    if (totalItems > 0 && onItemsPerPageChange) {
      // Still show the items count and page size selector if totalPages <= 1
    } else {
      return null;
    }
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t text-xs transition-colors ${
        isDark
          ? 'bg-[#22201D] border-[#3D3833] text-stone-300'
          : 'bg-[#F8F4EC] border-[#E8E2D8] text-stone-700'
      }`}
    >
      {/* Items count & page size option */}
      <div className="flex items-center gap-3">
        <span className="font-medium">
          Showing <span className="font-bold">{startItem}</span> to{' '}
          <span className="font-bold">{endItem}</span> of{' '}
          <span className="font-bold">{totalItems}</span> entries
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center space-x-1.5 ml-2">
            <span className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Show:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className={`px-2 py-1 border rounded-lg text-xs font-semibold focus:outline-none transition-colors ${
                isDark
                  ? 'bg-[#292623] border-[#3D3833] text-stone-200 focus:border-blue-500'
                  : 'bg-white border-[#E2DBD0] text-stone-800 focus:border-blue-500'
              }`}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center space-x-1">
          {/* First Page */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={`p-1.5 rounded-lg border transition-colors ${
              currentPage === 1
                ? 'opacity-40 cursor-not-allowed border-transparent'
                : isDark
                ? 'border-[#3D3833] bg-[#292623] hover:bg-[#33302C] text-stone-200'
                : 'border-[#E2DBD0] bg-white hover:bg-stone-100 text-stone-800'
            }`}
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-1.5 rounded-lg border transition-colors ${
              currentPage === 1
                ? 'opacity-40 cursor-not-allowed border-transparent'
                : isDark
                ? 'border-[#3D3833] bg-[#292623] hover:bg-[#33302C] text-stone-200'
                : 'border-[#E2DBD0] bg-white hover:bg-stone-100 text-stone-800'
            }`}
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {pageNumbers.map((num, idx) => {
              if (num === '...') {
                return (
                  <span
                    key={`dots-${idx}`}
                    className={`px-2 py-1 text-xs ${
                      isDark ? 'text-stone-500' : 'text-stone-400'
                    }`}
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = num === currentPage;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onPageChange(num)}
                  className={`min-w-[28px] h-7 px-2 py-1 text-xs font-bold rounded-lg transition-colors border ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : isDark
                      ? 'bg-[#292623] border-[#3D3833] text-stone-300 hover:bg-[#33302C]'
                      : 'bg-white border-[#E2DBD0] text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-1.5 rounded-lg border transition-colors ${
              currentPage === totalPages
                ? 'opacity-40 cursor-not-allowed border-transparent'
                : isDark
                ? 'border-[#3D3833] bg-[#292623] hover:bg-[#33302C] text-stone-200'
                : 'border-[#E2DBD0] bg-white hover:bg-stone-100 text-stone-800'
            }`}
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`p-1.5 rounded-lg border transition-colors ${
              currentPage === totalPages
                ? 'opacity-40 cursor-not-allowed border-transparent'
                : isDark
                ? 'border-[#3D3833] bg-[#292623] hover:bg-[#33302C] text-stone-200'
                : 'border-[#E2DBD0] bg-white hover:bg-stone-100 text-stone-800'
            }`}
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
