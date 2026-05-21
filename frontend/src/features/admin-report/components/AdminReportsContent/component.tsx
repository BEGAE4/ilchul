'use client';

import React from 'react';
import { Pagination } from '@/shared/ui/admin';
import { useAdminReportList } from '../../hooks';
import ReportFilters from '../ReportFilters';
import ReportListCards from '../ReportListCards';
import ReportListTable from '../ReportListTable';

const AdminReportsContent: React.FC = () => {
  const {
    data,
    totalCount,
    isLoading,
    isError,
    filters,
    setFilters,
  } = useAdminReportList();

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">신고</h2>
          <p className="mt-1 text-sm text-gray-600">
            접수된 신고를 검토하고 처분합니다.
          </p>
        </div>
        <span className="text-xs text-gray-500 tabular-nums">
          총 {totalCount.toLocaleString('ko-KR')}건
        </span>
      </header>

      <ReportFilters filters={filters} onChange={setFilters} />

      {isError ? (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded p-4 text-sm">
          신고를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <ReportListTable rows={data} isLoading={isLoading} />
          </div>
          <div className="md:hidden">
            <ReportListCards rows={data} isLoading={isLoading} />
          </div>
        </>
      )}

      <Pagination
        page={filters.page ?? 1}
        totalCount={totalCount}
        size={filters.size ?? 20}
        onPageChange={(next) => setFilters({ page: next })}
      />
    </div>
  );
};

export default AdminReportsContent;
