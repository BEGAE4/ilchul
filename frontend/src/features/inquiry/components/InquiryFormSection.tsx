'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { createInquiry, updateInquiry } from '../api/inquiry.api';
import type { Inquiry, InquiryCategory } from '../types/inquiry.types';
import { INQUIRY_CATEGORY_LABELS } from '../types/inquiry.types';

interface InquiryFormSectionProps {
  mode: 'create' | 'edit';
  existingInquiry?: Inquiry;
  onSuccess: (inquiry: Inquiry) => void;
  onCancel: () => void;
}

const CATEGORIES = Object.entries(INQUIRY_CATEGORY_LABELS) as [InquiryCategory, string][];
const MAX_CONTENT = 500;
const MAX_TITLE = 50;

export const InquiryFormSection = ({
  mode,
  existingInquiry,
  onSuccess,
  onCancel,
}: InquiryFormSectionProps) => {
  const [category, setCategory] = useState<InquiryCategory>(
    existingInquiry?.category ?? 'other'
  );
  const [title, setTitle] = useState(existingInquiry?.title ?? '');
  const [content, setContent] = useState(existingInquiry?.content ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      let result: Inquiry;
      if (mode === 'create') {
        result = await createInquiry({ category, title: title.trim(), content: content.trim() });
        toast.success('문의가 등록되었어요.');
      } else {
        result = await updateInquiry(existingInquiry!.inquiryId, {
          category,
          title: title.trim(),
          content: content.trim(),
        });
        toast.success('문의가 수정되었어요.');
      }
      onSuccess(result);
    } catch {
      toast.error('요청에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center p-4">
          <button onClick={onCancel} className="p-2 -ml-2 text-gray-700 rounded-full active:bg-gray-100">
            <ArrowLeft size={24} />
          </button>
          <span className="font-bold text-lg ml-2">
            {mode === 'create' ? '문의 작성' : '문의 수정'}
          </span>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === id
                    ? 'bg-sky-500 text-white'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_TITLE}
            placeholder="문의 제목을 입력해 주세요"
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-sky-400"
          />
          <div className="text-xs text-gray-400 mt-1 text-right">
            {title.length}/{MAX_TITLE}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CONTENT}
            placeholder="문의 내용을 자세히 입력해 주세요"
            rows={7}
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-sky-400 resize-none"
          />
          <div className="text-xs text-gray-400 mt-1 text-right">
            {content.length}/{MAX_CONTENT}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full bg-sky-500 text-white font-bold py-4 rounded-xl disabled:bg-gray-300 active:scale-[0.98] transition-all text-sm"
        >
          {isSubmitting ? '처리 중...' : mode === 'create' ? '문의 등록하기' : '수정 완료'}
        </button>
      </div>
    </div>
  );
};
