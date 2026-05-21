'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { Inquiry } from '../types/inquiry.types';
import { INQUIRY_CATEGORY_LABELS, INQUIRY_STATUS_LABELS } from '../types/inquiry.types';

interface InquiryCardProps {
  inquiry: Inquiry;
  showUser?: boolean;
  onClick: () => void;
  onAnswer?: () => void;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export const InquiryCard = ({ inquiry, showUser = false, onClick, onAnswer }: InquiryCardProps) => {
  const isPending = inquiry.status === 'pending';

  return (
    <div className="bg-white border-b border-gray-100 px-5 py-4 active:bg-gray-50 transition-colors">
      <button className="w-full text-left" onClick={onClick}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium bg-sky-50 text-sky-600 rounded-full px-2 py-0.5">
                {INQUIRY_CATEGORY_LABELS[inquiry.category]}
              </span>
              <span
                className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                  isPending ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-600'
                }`}
              >
                {INQUIRY_STATUS_LABELS[inquiry.status]}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate">{inquiry.title}</p>
            {showUser && (
              <p className="text-xs text-gray-400 mt-0.5">{inquiry.userNickname}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{formatDate(inquiry.createdAt)}</p>
          </div>
          <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
        </div>
      </button>

      {showUser && isPending && onAnswer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAnswer();
          }}
          className="mt-3 w-full py-2 border border-sky-400 text-sky-500 text-sm font-semibold rounded-xl active:bg-sky-50 transition-colors"
        >
          답변하기
        </button>
      )}
    </div>
  );
};
