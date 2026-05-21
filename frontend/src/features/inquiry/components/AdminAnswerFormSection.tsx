'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { fetchInquiryDetail, createAnswer } from '../api/inquiry.api';
import type { Inquiry } from '../types/inquiry.types';
import { INQUIRY_CATEGORY_LABELS } from '../types/inquiry.types';

interface AdminAnswerFormSectionProps {
  inquiryId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const MAX_ANSWER = 1000;

export const AdminAnswerFormSection = ({
  inquiryId,
  onSuccess,
  onCancel,
}: AdminAnswerFormSectionProps) => {
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInquiryDetail(inquiryId)
      .then(setInquiry)
      .finally(() => setIsLoading(false));
  }, [inquiryId]);

  const handleSubmit = async () => {
    if (!answerContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createAnswer(inquiryId, { content: answerContent.trim() });
      toast.success('답변이 등록되었어요.');
      onSuccess();
    } catch {
      toast.error('답변 등록에 실패했어요. 다시 시도해 주세요.');
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
          <span className="font-bold text-lg ml-2">답변 작성</span>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        {isLoading || !inquiry ? (
          <div className="space-y-3">
            <div className="h-5 w-1/3 bg-gray-100 rounded animate-pulse" />
            <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium bg-sky-50 text-sky-600 rounded-full px-2 py-0.5">
                {INQUIRY_CATEGORY_LABELS[inquiry.category]}
              </span>
              <span className="text-xs text-gray-400">
                {inquiry.userNickname}
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-2">{inquiry.title}</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {inquiry.content}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">답변 내용</label>
          <textarea
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            maxLength={MAX_ANSWER}
            placeholder="사용자에게 친절하게 답변해 주세요"
            rows={8}
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-sky-400 resize-none"
          />
          <div className="text-xs text-gray-400 mt-1 text-right">
            {answerContent.length}/{MAX_ANSWER}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleSubmit}
          disabled={!answerContent.trim() || isSubmitting}
          className="w-full bg-sky-500 text-white font-bold py-4 rounded-xl disabled:bg-gray-300 active:scale-[0.98] transition-all text-sm"
        >
          {isSubmitting ? '등록 중...' : '답변 등록하기'}
        </button>
      </div>
    </div>
  );
};
