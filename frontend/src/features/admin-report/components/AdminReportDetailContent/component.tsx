'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/shared/ui/admin';
import { useAdminReportDetail } from '../../hooks';
import ReportDetailPanel from '../ReportDetailPanel';
import SanctionForm from '../SanctionForm';

interface AdminReportDetailContentProps {
  reportId: string;
}

const AdminReportDetailContent: React.FC<AdminReportDetailContentProps> = ({ reportId }) => {
  const router = useRouter();
  const { data, isLoading, isError, patchStatus, setData } = useAdminReportDetail(reportId);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [isPatching, setIsPatching] = useState(false);

  const handleStatusChange = async (status: 'REVIEWING' | 'REJECTED') => {
    setIsPatching(true);
    try {
      await patchStatus({ status });
      toast.success(status === 'REVIEWING' ? '검토중으로 변경되었습니다.' : '신고가 거절되었습니다.');
      setRejectOpen(false);
    } catch {
      toast.error('상태 변경에 실패했습니다.');
    } finally {
      setIsPatching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-gray-200 bg-white rounded p-4">
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mb-3" />
                <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="border border-gray-200 bg-white rounded p-4">
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-3" />
            <div className="space-y-2">
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push('/admin/reports')}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} /> 목록으로
        </button>
        <div className="border border-red-200 bg-red-50 text-red-700 rounded p-4 text-sm">
          신고를 불러오지 못했습니다.
        </div>
      </div>
    );
  }

  const isClosed = data.status === 'RESOLVED' || data.status === 'REJECTED';
  const canMoveToReview = data.status === 'PENDING';

  return (
    <div className="space-y-4">
      {/* 상단 액션 바 */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => router.push('/admin/reports')}
          className="inline-flex items-center gap-1 px-2 py-1.5 text-sm text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft size={16} /> 목록
        </button>
        <div className="ml-auto flex gap-2">
          {canMoveToReview && (
            <button
              type="button"
              onClick={() => handleStatusChange('REVIEWING')}
              disabled={isPatching}
              className="px-3 py-1.5 text-sm border border-gray-200 bg-white text-gray-700 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              검토중으로 변경
            </button>
          )}
          {!isClosed && (
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              disabled={isPatching}
              className="px-3 py-1.5 text-sm border border-gray-200 bg-white text-gray-700 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              신고 거절
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <ReportDetailPanel detail={data} />
        </div>
        <div className="md:col-span-1">
          <div className="md:sticky md:top-20">
            {isClosed ? (
              <div className="border border-gray-200 bg-gray-50 rounded p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">처리 완료된 신고입니다.</p>
                <p className="mt-1 text-xs text-gray-500">
                  이미 처분이 적용되었으므로 추가 처리할 수 없습니다.
                </p>
              </div>
            ) : (
              <SanctionForm
                reportId={data.reportId}
                targetType={data.target.type}
                onIssued={(next) => setData(next)}
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="이 신고를 거절할까요?"
        description="거절된 신고는 처분 없이 종료되며, 신고자에게는 별도 통보되지 않습니다."
        confirmLabel="거절"
        destructive
        isPending={isPatching}
        onConfirm={() => handleStatusChange('REJECTED')}
      />
    </div>
  );
};

export default AdminReportDetailContent;
