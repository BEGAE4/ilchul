'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PenLine } from 'lucide-react';
import { fetchAllMyInquiries } from '../api/inquiry.api';
import type { InquiryListItem, InquiryStatus } from '../types/inquiry.types';
import { filterInquiriesByStatus } from '../utils/inquiryMapper';
import { InquiryCard } from './InquiryCard';

interface InquiryListSectionProps {
  // 상세 조회가 실패해도 상세 화면이 목록 정보로 대신 그릴 수 있게 아이템째 넘긴다
  onSelectInquiry: (inquiry: InquiryListItem) => void;
  onCreateNew: () => void;
}

const TABS: { id: InquiryStatus; label: string }[] = [
  { id: 'PENDING', label: '답변 대기' },
  { id: 'ANSWERED', label: '답변 완료' },
];

export const InquiryListSection = ({ onSelectInquiry, onCreateNew }: InquiryListSectionProps) => {
  const [inquiries, setInquiries] = useState<InquiryListItem[]>([]);
  const [activeTab, setActiveTab] = useState<InquiryStatus>('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // 서버에 상태 필터가 없다 — 한 번만 받아 두고 탭은 화면에서 거른다(탭 전환 시 재요청 없음).
  // 작성·수정·삭제 뒤에는 이 섹션이 다시 마운트되면서 새로 받아온다.
  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setIsError(false);
    fetchAllMyInquiries()
      .then((items) => {
        if (alive) setInquiries(items);
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
          // 빈 목록과 구분한다 — 실패를 '문의 없음'으로 보여 주면 보낸 문의가 사라진 것처럼 보인다
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm text-gray-600">문의 목록을 불러오지 못했어요</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-4 px-4 py-2 border border-primary-400 text-primary-500 text-sm font-semibold rounded-xl active:bg-primary-50 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : visibleInquiries.length === 0 ? (
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
                onClick={() => onSelectInquiry(inquiry)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100">
        <button
          onClick={onCreateNew}
          className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white font-bold py-4 rounded-xl active:scale-[0.98] transition-all text-sm"
        >
          <PenLine size={16} />
          문의하기
        </button>
      </div>
    </div>
  );
};
