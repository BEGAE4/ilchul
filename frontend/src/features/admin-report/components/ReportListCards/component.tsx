'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertOctagon, FileText, MessageSquare, User } from 'lucide-react';
import { EmptyState } from '@/shared/ui/admin';
import { REASON_LABELS } from '@/features/report';
import type { ReportTarget, ReportTargetType } from '@/features/report';
import ReportStatusBadge from '../ReportStatusBadge';
import type { AdminReportListItem } from '../../types';

interface ReportListCardsProps {
  rows: AdminReportListItem[];
  isLoading: boolean;
}

const TARGET_LABELS: Record<ReportTargetType, string> = {
  course: '코스',
  comment: '댓글',
  user: '사용자',
};

function targetIcon(type: ReportTarget['type']) {
  switch (type) {
    case 'course':
      return <FileText size={12} />;
    case 'comment':
      return <MessageSquare size={12} />;
    case 'user':
      return <User size={12} />;
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

const ReportListCards: React.FC<ReportListCardsProps> = ({ rows, isLoading }) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border border-gray-200 bg-white rounded p-3 animate-pulse space-y-2">
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
            <div className="h-3 w-1/2 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="처리할 신고가 없습니다"
        description="필터를 변경하면 다른 신고를 볼 수 있어요."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.reportId}>
          <button
            type="button"
            onClick={() => router.push(`/admin/reports/${row.reportId}`)}
            className="w-full text-left border border-gray-200 bg-white rounded p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <ReportStatusBadge status={row.status} />
              {row.autoBlinded && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium border border-red-200 bg-red-50 text-red-700 rounded">
                  <AlertOctagon size={10} />
                  블라인드
                </span>
              )}
              <span className="ml-auto text-xs text-gray-500">
                {relativeTime(row.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <span className="inline-flex items-center gap-1">
                {targetIcon(row.target.type)}
                {TARGET_LABELS[row.target.type]}
              </span>
              <span>·</span>
              <span>{REASON_LABELS[row.reasonCode]}</span>
            </div>
            <p className="text-sm text-gray-900 truncate">{targetLabel(row.target)}</p>
            <p className="mt-1 text-xs text-gray-500">
              신고자 {row.reporterNickname} · 누적 {row.reportCount}건
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ReportListCards;
