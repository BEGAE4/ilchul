'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/shared/ui/admin';
import InquiryStatusBadge from '../InquiryStatusBadge';
import type { AdminInquiryListItem } from '../../types';
import { INQUIRY_CATEGORY_LABELS } from '../../types';

interface InquiryListCardsProps {
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

const InquiryListCards: React.FC<InquiryListCardsProps> = ({ rows, isLoading }) => {
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
        title="접수된 문의가 없습니다"
        description="필터를 변경하면 다른 문의를 볼 수 있어요."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.inquiryId}>
          <button
            type="button"
            onClick={() => router.push(`/admin/inquiries/${row.inquiryId}`)}
            className="w-full text-left border border-gray-200 bg-white rounded p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <InquiryStatusBadge status={row.status} />
              <span className="text-[11px] text-gray-500">
                {INQUIRY_CATEGORY_LABELS[row.category]}
              </span>
              <span className="ml-auto text-xs text-gray-500">
                {relativeTime(row.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {row.hasUnreadByAuthor && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
              )}
              <p className="text-sm text-gray-900 truncate flex-1">{row.title}</p>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              작성자 {row.author.nickname} · 답변 {row.answerCount}개
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default InquiryListCards;
