'use client';

import Image from '@/shared/ui/SafeImage';
import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { fetchInquiryDetail, createAnswer } from '../api/inquiry.api';
import type { InquiryDetail, InquiryListItem } from '../types/inquiry.types';

interface AdminAnswerFormSectionProps {
  inquiryId: number;
  /** 목록에서 넘어온 요약 — 상세 조회가 실패하면 이것으로 대신 그린다 */
  fallbackItem?: InquiryListItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const MAX_ANSWER = 1000;

export const AdminAnswerFormSection = ({
  inquiryId,
  fallbackItem = null,
  onSuccess,
  onCancel,
}: AdminAnswerFormSectionProps) => {
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // 상세를 못 받아도 목록 요약을 보고 답변은 쓸 수 있게 둔다 — 본문 자리에 실패를 알리고 다시 시도를 준다
  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setLoadFailed(false);
    fetchInquiryDetail(inquiryId)
      .then((detail) => {
        if (alive) setInquiry(detail);
      })
      .catch(() => {
        // 아래에서 fallbackItem 으로 대신 그린다
        if (alive) setLoadFailed(true);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [inquiryId, reloadKey]);

  const summary = inquiry ?? fallbackItem;

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
    <div className="flex flex-col min-h-dvh bg-white">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center p-4">
          <button onClick={onCancel} className="p-2 -ml-2 text-gray-700 rounded-full active:bg-gray-100">
            <ArrowLeft size={24} />
          </button>
          <span className="font-bold text-lg ml-2">답변 작성</span>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-5 w-1/3 bg-gray-100 rounded animate-pulse" />
            <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        ) : (
          <div>
            {summary && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium bg-primary-50 text-primary-600 rounded-full px-2 py-0.5">
                    {summary.categoryName}
                  </span>
                  {summary.authorNickname && (
                    <span className="text-xs text-gray-400">{summary.authorNickname}</span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">{summary.title}</h3>
              </>
            )}
            <div className="bg-gray-50 rounded-xl p-4">
              {inquiry ? (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {inquiry.content}
                </p>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-400">문의 내용을 불러오지 못했어요</p>
                  {loadFailed && (
                    <button
                      type="button"
                      onClick={() => setReloadKey((k) => k + 1)}
                      className="mt-2 px-3 py-1.5 text-xs font-bold text-primary-600 bg-primary-50 rounded-full active:scale-95 transition-transform"
                    >
                      다시 시도
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* 첨부 — 작성자·관리자만 받을 수 있는 API 경로라 같은 출처의 이미지로 그대로 연다 */}
            {inquiry && inquiry.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {inquiry.images.map((img) => (
                  <a
                    key={img.imageId}
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                  >
                    <Image src={img.url} alt="첨부 이미지" fill sizes="33vw" className="object-cover" unoptimized />
                  </a>
                ))}
              </div>
            )}
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
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-primary-400 resize-none"
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
          className="w-full bg-primary-500 text-white font-bold py-4 rounded-xl disabled:bg-gray-300 active:scale-[0.98] transition-all text-sm"
        >
          {isSubmitting ? '등록 중...' : '답변 등록하기'}
        </button>
      </div>
    </div>
  );
};
