'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertOctagon, FileText, MessageSquare, User } from 'lucide-react';
import { DataTable } from '@/shared/ui/admin';
import type { DataTableColumn } from '@/shared/ui/admin';
import { REASON_LABELS } from '@/features/report';
import type { ReportTarget } from '@/features/report';
import ReportStatusBadge from '../ReportStatusBadge';
import type { AdminReportListItem } from '../../types';

interface ReportListTableProps {
  rows: AdminReportListItem[];
  isLoading: boolean;
}

function targetIcon(type: ReportTarget['type']) {
  switch (type) {
    case 'course':
      return <FileText size={14} />;
    case 'comment':
      return <MessageSquare size={14} />;
    case 'user':
      return <User size={14} />;
  }
}

function targetLabel(target: ReportTarget): string {
  if (target.type === 'course') return target.title;
  if (target.type === 'comment') return target.snippet;
  return target.nickname;
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

const ReportListTable: React.FC<ReportListTableProps> = ({ rows, isLoading }) => {
  const router = useRouter();

  const columns: DataTableColumn<AdminReportListItem>[] = [
    {
      key: 'status',
      header: '상태',
      width: 'w-20',
      render: (r) => <ReportStatusBadge status={r.status} />,
    },
    {
      key: 'target',
      header: '대상',
      render: (r) => (
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-gray-500 shrink-0">{targetIcon(r.target.type)}</span>
          <span className="truncate text-gray-900">{targetLabel(r.target)}</span>
          {r.autoBlinded && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium border border-red-200 bg-red-50 text-red-700 rounded shrink-0"
              title="자동 블라인드 처리됨"
            >
              <AlertOctagon size={10} />
              블라인드
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'reporter',
      header: '신고자',
      width: 'w-28',
      render: (r) => <span className="text-gray-700">{r.reporterNickname}</span>,
    },
    {
      key: 'reason',
      header: '사유',
      width: 'w-28',
      render: (r) => <span className="text-gray-700">{REASON_LABELS[r.reasonCode]}</span>,
    },
    {
      key: 'count',
      header: '누적',
      width: 'w-16',
      align: 'right',
      render: (r) => (
        <span className={`tabular-nums ${r.reportCount >= 5 ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
          {r.reportCount}
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
      rowKey={(r) => r.reportId}
      isLoading={isLoading}
      onRowClick={(r) => router.push(`/admin/reports/${r.reportId}`)}
      emptyTitle="처리할 신고가 없습니다"
      emptyDescription="필터를 변경하면 다른 신고를 볼 수 있어요."
    />
  );
};

export default ReportListTable;
