'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { FilterChip } from '@/shared/ui/admin';
import { REASON_LABELS } from '@/features/report';
import type { ReportReasonCode, ReportStatus, ReportTargetType } from '@/features/report';
import type { AdminReportListParams, AdminReportSort } from '../../types';

interface ReportFiltersProps {
  filters: Required<Omit<AdminReportListParams, 'autoBlindedOnly'>> & { autoBlindedOnly: boolean };
  onChange: (next: Partial<AdminReportListParams>) => void;
}

const STATUS_TABS: Array<{ value: ReportStatus | 'all'; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'PENDING', label: '대기' },
  { value: 'REVIEWING', label: '검토중' },
  { value: 'RESOLVED', label: '처리완료' },
  { value: 'REJECTED', label: '거절' },
];

const TARGET_OPTIONS: Array<{ value: ReportTargetType | 'all'; label: string }> = [
  { value: 'all', label: '대상: 전체' },
  { value: 'course', label: '코스' },
  { value: 'comment', label: '댓글' },
  { value: 'user', label: '사용자' },
];

const REASON_OPTIONS: Array<{ value: ReportReasonCode | 'all'; label: string }> = [
  { value: 'all', label: '사유: 전체' },
  ...(Object.keys(REASON_LABELS) as ReportReasonCode[]).map((code) => ({
    value: code,
    label: REASON_LABELS[code],
  })),
];

const SORT_OPTIONS: Array<{ value: AdminReportSort; label: string }> = [
  { value: 'createdAt:desc', label: '최신순' },
  { value: 'createdAt:asc', label: '오래된순' },
  { value: 'reportCount:desc', label: '누적 신고 많은 순' },
];

const DEBOUNCE_MS = 300;

const ReportFilters: React.FC<ReportFiltersProps> = ({ filters, onChange }) => {
  const [keyword, setKeyword] = useState(filters.q ?? '');
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 외부 URL 변경(예: brower back)으로 q가 바뀌면 input도 따라온다.
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
      {/* 상태 탭 (전 너비 가로 스크롤) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_TABS.map((tab) => (
          <FilterChip
            key={tab.value}
            label={tab.label}
            active={(filters.status ?? 'all') === tab.value}
            onClick={() => onChange({ status: tab.value })}
          />
        ))}
        <span className="mx-1 w-px bg-gray-200 shrink-0" />
        <FilterChip
          label="자동 블라인드만"
          active={filters.autoBlindedOnly}
          onClick={() => onChange({ autoBlindedOnly: !filters.autoBlindedOnly })}
        />
      </div>

      {/* 대상 / 사유 / 정렬 / 검색 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <select
          value={filters.targetType ?? 'all'}
          onChange={(e) => onChange({ targetType: e.target.value as ReportTargetType | 'all' })}
          className="text-sm border border-gray-200 bg-white rounded px-2 py-1.5 text-gray-700"
          aria-label="대상 유형"
        >
          {TARGET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={filters.reasonCode ?? 'all'}
          onChange={(e) => onChange({ reasonCode: e.target.value as ReportReasonCode | 'all' })}
          className="text-sm border border-gray-200 bg-white rounded px-2 py-1.5 text-gray-700"
          aria-label="신고 사유"
        >
          {REASON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={filters.sort ?? 'createdAt:desc'}
          onChange={(e) => onChange({ sort: e.target.value as AdminReportSort })}
          className="text-sm border border-gray-200 bg-white rounded px-2 py-1.5 text-gray-700"
          aria-label="정렬"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <div className="relative">
          <Search
            size={14}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="신고자/대상 검색"
            aria-label="검색"
            className="w-full text-sm border border-gray-200 bg-white rounded pl-7 pr-2 py-1.5 text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
