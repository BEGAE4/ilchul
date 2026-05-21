'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalCount: number;
  size: number;
  onPageChange: (next: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalCount, size, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / size));
  if (totalPages <= 1) return null;

  const windowSize = 5;
  const start = Math.max(1, Math.min(page - Math.floor(windowSize / 2), totalPages - windowSize + 1));
  const end = Math.min(totalPages, start + windowSize - 1);
  const pages: number[] = [];
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <nav
      className="flex items-center justify-center gap-1 py-4 text-sm"
      aria-label="페이지네이션"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-2 py-1.5 border border-gray-200 bg-white text-gray-700 rounded disabled:opacity-40 hover:bg-gray-50"
        aria-label="이전 페이지"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`min-w-[32px] px-2 py-1.5 border rounded text-sm ${
            p === page
              ? 'border-blue-600 bg-blue-600 text-white font-medium'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-2 py-1.5 border border-gray-200 bg-white text-gray-700 rounded disabled:opacity-40 hover:bg-gray-50"
        aria-label="다음 페이지"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};

export default Pagination;
