'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { FilterChip } from '@/shared/ui/admin';
import type {
  AdminInquiryListParams,
  AdminInquirySort,
  InquiryCategory,
  InquiryStatus,
} from '../../types';
import { INQUIRY_CATEGORY_LABELS } from '../../types';

interface InquiryFiltersProps {
  filters: Required<AdminInquiryListParams>;
  onChange: (next: Partial<AdminInquiryListParams>) => void;
}

const STATUS_TABS: Array<{ value: InquiryStatus | 'all'; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'OPEN', label: '미답변' },
  { value: 'ANSWERED', label: '답변완료' },
  { value: 'CLOSED', label: '마감' },
];

const CATEGORY_OPTIONS: Array<{ value: InquiryCategory | 'all'; label: string }> = [
  { value: 'all', label: '카테고리: 전체' },
  ...(Object.keys(INQUIRY_CATEGORY_LABELS) as InquiryCategory[]).map((code) => ({
    value: code,
    label: INQUIRY_CATEGORY_LABELS[code],
  })),
];

const SORT_OPTIONS: Array<{ value: AdminInquirySort; label: string }> = [
  { value: 'createdAt:desc', label: '최신 접수' },
  { value: 'updatedAt:desc', label: '최근 활동' },
];

const DEBOUNCE_MS = 300;

const InquiryFilters: React.FC<InquiryFiltersProps> = ({ filters, onChange }) => {
  const [keyword, setKeyword] = useState(filters.q ?? '');
  const isFirstRender = useRef(true);

  useEffect(() => {
    setKeyword(filters.q ?? '');
  }, [filters.q]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (keyword === (filters.q ?? '')) return;
    const t = setTimeout(() => onChange({ q: keyword }), DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_TABS.map((tab) => (
          <FilterChip
            key={tab.value}
            label={tab.label}
            active={(filters.status ?? 'all') === tab.value}
            onClick={() => onChange({ status: tab.value })}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <select
          value={filters.category ?? 'all'}
          onChange={(e) => onChange({ category: e.target.value as InquiryCategory | 'all' })}
          className="text-sm border border-gray-200 bg-white rounded px-2 py-1.5 text-gray-700"
          aria-label="카테고리"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={filters.sort ?? 'createdAt:desc'}
          onChange={(e) => onChange({ sort: e.target.value as AdminInquirySort })}
          className="text-sm border border-gray-200 bg-white rounded px-2 py-1.5 text-gray-700"
          aria-label="정렬"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <div className="relative col-span-2 md:col-span-1">
          <Search
            size={14}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="제목/본문/작성자 검색"
            aria-label="검색"
            className="w-full text-sm border border-gray-200 bg-white rounded pl-7 pr-2 py-1.5 text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
};

export default InquiryFilters;
