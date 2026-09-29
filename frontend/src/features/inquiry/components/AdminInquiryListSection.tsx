'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { fetchAllInquiries } from '../api/inquiry.api';
import type { InquiryListItem, InquiryStatus } from '../types/inquiry.types';
import { filterInquiriesByStatus } from '../utils/inquiryMapper';
import { InquiryCard } from './InquiryCard';

interface AdminInquiryListSectionProps {
  // 상세 조회가 실패해도 다음 화면이 목록 정보로 대신 그릴 수 있게 아이템째 넘긴다
  onSelectInquiry: (inquiry: InquiryListItem) => void;
  onAnswerInquiry: (inquiry: InquiryListItem) => void;
}

const PAGE_SIZE = 50;

const TABS: { id: InquiryStatus; label: string }[] = [
  { id: 'PENDING', label: '답변 대기' },
  { id: 'ANSWERED', label: '답변 완료' },
];

export const AdminInquiryListSection = ({
  onSelectInquiry,
  onAnswerInquiry,
}: AdminInquiryListSectionProps) => {
  const [inquiries, setInquiries] = useState<InquiryListItem[]>([]);
  const [activeTab, setActiveTab] = useState<InquiryStatus>('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [nextCursorId, setNextCursorId] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 서버에 상태 필터가 없다 — 받아온 목록을 탭별로 화면에서 거른다(탭 전환 시 재요청 없음)
  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setIsError(false);
    fetchAllInquiries({ size: PAGE_SIZE })
      .then((res) => {
        if (!alive) return;
        setInquiries(res.items);
        setNextCursorId(res.hasNext ? res.nextCursorId : null);
      })
      .catch(() => {
        if (alive) setIsError(true);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const handleLoadMore = async () => {
    if (nextCursorId === null || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetchAllInquiries({ size: PAGE_SIZE, lastInquiryId: nextCursorId });
      setInquiries((prev) => [...prev, ...res.items]);
      setNextCursorId(res.hasNext ? res.nextCursorId : null);
    } catch {
      // 이미 받은 목록은 그대로 두고, 버튼을 다시 누를 수 있게만 한다
    } finally {
      setIsLoadingMore(false);
    }
  };

  const visibleInquiries = useMemo(
    () => filterInquiriesByStatus(inquiries, activeTab),
    [inquiries, activeTab]
  );

  return (
    <div className="flex flex-col flex-1">
      <div className="flex border-b border-gray-100 sticky top-[57px] bg-white z-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
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
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm text-gray-600">문의 목록을 불러오지 못했어요</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-4 px-4 py-2 border border-primary-400 text-primary-500 text-sm font-semibold rounded-xl active:bg-primary-50 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : visibleInquiries.length === 0 && nextCursorId === null ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-4xl mb-3">📭</span>
            <p className="text-sm">
              {activeTab === 'PENDING' ? '답변 대기 중인 문의가 없어요' : '답변 완료된 문의가 없어요'}
            </p>
          </div>
        ) : (
          <div>
            {visibleInquiries.map((inquiry) => (
              <InquiryCard
                key={inquiry.inquiryId}
                inquiry={inquiry}
                showUser
                onClick={() => onSelectInquiry(inquiry)}
                onAnswer={
                  inquiry.status === 'PENDING' ? () => onAnswerInquiry(inquiry) : undefined
                }
              />
            ))}
            {nextCursorId !== null && (
              <div className="p-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl active:bg-gray-50 disabled:text-gray-300"
                >
                  {isLoadingMore ? '불러오는 중...' : '더 보기'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
