'use client';

import React from 'react';

interface PaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function Pagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 12, 24, 48],
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const goTo = (page: number) => {
    const p = Math.max(1, Math.min(totalPages, page));
    if (p === currentPage) return;
    onPageChange(p);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const renderPageButtons = () => {
    const pages: (number | 'dots')[] = [];
    for (let p = 1; p <= totalPages; p++) {
      if (
        p === 1 ||
        p === totalPages ||
        Math.abs(p - currentPage) <= 2
      ) {
        pages.push(p);
      } else if (
        (p === currentPage - 3 && p > 1) ||
        (p === currentPage + 3 && p < totalPages)
      ) {
        pages.push('dots');
      }
    }

    return pages.map((item, idx) => {
      if (item === 'dots') {
        return <span key={`dots-${idx}`} className="px-2 text-emerald-300">…</span>;
      }
      const page = item as number;
      const isActive = page === currentPage;
      return (
        <button
          key={page}
          onClick={() => goTo(page)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? 'bg-yellow-500 text-black'
              : 'bg-slate-800 text-emerald-200 hover:bg-slate-700'
          }`}
          aria-current={isActive ? 'page' : undefined}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className={`mt-6 flex flex-col md:flex-row items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md bg-slate-700 text-white disabled:opacity-50"
        >
          ← Prev
        </button>

        <div className="flex items-center gap-1">
          {renderPageButtons()}
        </div>

        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-md bg-slate-700 text-white disabled:opacity-50"
        >
          Next →
        </button>
      </div>

      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-emerald-200 text-sm">Items per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            className="px-2 py-1 rounded-md bg-slate-800 text-emerald-200"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}