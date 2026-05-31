'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/shared/ui/admin';
import type { DataTableColumn } from '@/shared/ui/admin';
import InquiryStatusBadge from '../InquiryStatusBadge';
import type { AdminInquiryListItem } from '../../types';
import { INQUIRY_CATEGORY_LABELS } from '../../types';

interface InquiryListTableProps {
  rows: AdminInquiryListItem[];
  isLoading: boolean;
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR');
}

const InquiryListTable: React.FC<InquiryListTableProps> = ({ rows, isLoading }) => {
  const router = useRouter();

  const columns: DataTableColumn<AdminInquiryListItem>[] = [
    {
      key: 'status',
      header: '상태',
      width: 'w-24',
      render: (r) => <InquiryStatusBadge status={r.status} />,
    },
    {
      key: 'category',
      header: '카테고리',
      width: 'w-32',
      render: (r) => (
        <span className="text-gray-700">{INQUIRY_CATEGORY_LABELS[r.category]}</span>
      ),
    },
    {
      key: 'title',
      header: '제목',
      render: (r) => (
        <div className="flex items-center gap-2 min-w-0">
          {r.hasUnreadByAuthor && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"
              title="작성자 미열람"
            />
          )}
          <span className="truncate text-gray-900">{r.title}</span>
        </div>
      ),
    },
    {
      key: 'author',
      header: '작성자',
      width: 'w-28',
      render: (r) => <span className="text-gray-700">{r.author.nickname}</span>,
    },
    {
      key: 'answers',
      header: '답변',
      width: 'w-16',
      align: 'right',
      render: (r) => (
        <span className={`tabular-nums ${r.answerCount > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
          {r.answerCount}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: '접수',
      width: 'w-24',
      render: (r) => (
        <span className="text-gray-600" title={new Date(r.createdAt).toLocaleString('ko-KR')}>
          {relativeTime(r.createdAt)}
        </span>
      ),
    },
    {
      key: 'operator',
      header: '담당',
      width: 'w-24',
      render: (r) => (
        <span className={r.assignedOperator ? 'text-gray-700' : 'text-gray-400'}>
          {r.assignedOperator ?? '미배정'}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.inquiryId}
      isLoading={isLoading}
      onRowClick={(r) => router.push(`/admin/inquiries/${r.inquiryId}`)}
      emptyTitle="접수된 문의가 없습니다"
      emptyDescription="필터를 변경하면 다른 문의를 볼 수 있어요."
    />
  );
};

export default InquiryListTable;
