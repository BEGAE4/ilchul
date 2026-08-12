'use client';

import React, { useEffect, useState } from 'react';
import { fetchAllInquiries } from '../api/inquiry.api';
import type { InquiryListItem } from '../types/inquiry.types';
import { InquiryCard } from './InquiryCard';

interface AdminInquiryListSectionProps {
  onSelectInquiry: (id: number) => void;
  onAnswerInquiry: (id: number) => void;
}

// 답변 유무 탭 — 서버 필터가 없어 hasAnswer 기준으로 클라이언트에서 구분한다.
type AnswerTab = 'pending' | 'answered';
const TABS: { id: AnswerTab; label: string }[] = [
  { id: 'pending', label: '답변 대기' },
  { id: 'answered', label: '답변 완료' },
];

export const AdminInquiryListSection = ({
  onSelectInquiry,
  onAnswerInquiry,
}: AdminInquiryListSectionProps) => {
  const [inquiries, setInquiries] = useState<InquiryListItem[]>([]);
  const [activeTab, setActiveTab] = useState<AnswerTab>('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    fetchAllInquiries()
      .then((res) => {
        if (alive) setInquiries(res.items);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const visibleInquiries = inquiries.filter((i) =>
    activeTab === 'answered' ? i.hasAnswer : !i.hasAnswer
  );

  return (
    <div className="flex flex-col flex-1">
      <div className="flex border-b border-gray-100 sticky top-[57px] bg-white z-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === tab.id ? 'text-sky-500' : 'text-gray-400'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="space-y-0 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-5 py-4 border-b border-gray-100">
                <div className="flex gap-2 mb-2">
                  <div className="h-5 w-14 bg-gray-100 rounded-full animate-pulse" />
                  <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                </div>
                <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse mb-1" />
                <div className="h-3 w-1/4 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : visibleInquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-4xl mb-3">📭</span>
            <p className="text-sm">
              {activeTab === 'pending' ? '답변 대기 중인 문의가 없어요' : '답변 완료된 문의가 없어요'}
            </p>
          </div>
        ) : (
          <div>
            {visibleInquiries.map((inquiry) => (
              <InquiryCard
                key={inquiry.inquiryId}
                inquiry={inquiry}
                showUser
                onClick={() => onSelectInquiry(inquiry.inquiryId)}
                onAnswer={
                  !inquiry.hasAnswer
                    ? () => onAnswerInquiry(inquiry.inquiryId)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
