'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/shared/ui/admin';
import { useAdminInquiryDetail } from '../../hooks';
import InquiryDetailPanel from '../InquiryDetailPanel';
import AnswerList from '../AnswerList';
import AnswerForm from '../AnswerForm';

interface AdminInquiryDetailContentProps {
  inquiryId: string;
}

const AdminInquiryDetailContent: React.FC<AdminInquiryDetailContentProps> = ({ inquiryId }) => {
  const router = useRouter();
  const { data, isLoading, isError, patchStatus, setData } = useAdminInquiryDetail(inquiryId);
  const [closeOpen, setCloseOpen] = useState(false);
  const [isPatching, setIsPatching] = useState(false);

  const handleClose = async () => {
    setIsPatching(true);
    try {
      await patchStatus('CLOSED');
      toast.success('문의가 마감되었습니다.');
      setCloseOpen(false);
    } catch {
      toast.error('상태 변경에 실패했습니다.');
    } finally {
      setIsPatching(false);
    }
  };

  const handleReopen = async () => {
    setIsPatching(true);
    try {
      await patchStatus(data && data.answerCount > 0 ? 'ANSWERED' : 'OPEN');
      toast.success('문의가 재개되었습니다.');
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
            <div className="h-24 bg-gray-100 rounded animate-pulse" />
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
          onClick={() => router.push('/admin/inquiries')}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} /> 목록으로
        </button>
        <div className="border border-red-200 bg-red-50 text-red-700 rounded p-4 text-sm">
          문의를 불러오지 못했습니다.
        </div>
      </div>
    );
  }

  const isClosed = data.status === 'CLOSED';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => router.push('/admin/inquiries')}
          className="inline-flex items-center gap-1 px-2 py-1.5 text-sm text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft size={16} /> 목록
        </button>
        <div className="ml-auto flex gap-2">
          {isClosed ? (
            <button
              type="button"
              onClick={handleReopen}
              disabled={isPatching}
              className="px-3 py-1.5 text-sm border border-gray-200 bg-white text-gray-700 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              문의 재개
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCloseOpen(true)}
              disabled={isPatching}
              className="px-3 py-1.5 text-sm border border-gray-200 bg-white text-gray-700 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              문의 마감
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <InquiryDetailPanel detail={data} />

          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                답변 {data.answers.length}개
              </h3>
            </div>
            <AnswerList
              inquiryId={data.inquiryId}
              answers={data.answers}
              onChange={setData}
            />
          </section>
        </div>

        <div className="md:col-span-1">
          <div className="md:sticky md:top-20">
            {isClosed ? (
              <div className="border border-gray-200 bg-gray-50 rounded p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">마감된 문의입니다.</p>
                <p className="mt-1 text-xs text-gray-500">
                  답변을 추가하려면 먼저 "문의 재개"를 눌러주세요.
                </p>
              </div>
            ) : (
              <AnswerForm inquiryId={data.inquiryId} onCreated={setData} />
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        title="이 문의를 마감할까요?"
        description="마감 후에도 재개할 수 있습니다. 사용자에게는 마감 사실이 통보되지 않습니다."
        confirmLabel="마감"
        isPending={isPatching}
        onConfirm={handleClose}
      />
    </div>
  );
};

export default AdminInquiryDetailContent;
