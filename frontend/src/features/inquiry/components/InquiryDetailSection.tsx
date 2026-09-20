'use client';

import React, { useEffect, useState } from 'react';
import Image from '@/shared/ui/SafeImage';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchInquiryDetail, deleteInquiry } from '../api/inquiry.api';
import type { InquiryDetail, InquiryListItem } from '../types/inquiry.types';
import { INQUIRY_STATUS_LABELS } from '../types/inquiry.types';
import {
  formatInquiryDate,
  inquiryDetailErrorKind,
  type InquiryDetailErrorKind,
} from '../utils/inquiryMapper';

interface InquiryDetailSectionProps {
  inquiryId: number;
  /** 목록에서 넘어온 요약 — 상세 조회가 실패하면 이것으로 대신 그린다 */
  fallbackItem?: InquiryListItem | null;
  isAdmin?: boolean;
  onBack: () => void;
  onEdit: (inquiry: InquiryDetail) => void;
  onDeleted: () => void;
}

const formatDate = (iso: string) => formatInquiryDate(iso, true);

export const InquiryDetailSection = ({
  inquiryId,
  fallbackItem = null,
  isAdmin = false,
  onBack,
  onEdit,
  onDeleted,
}: InquiryDetailSectionProps) => {
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // 상세를 못 받은 이유. null 이면 실패하지 않은 것
  const [loadError, setLoadError] = useState<InquiryDetailErrorKind | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 상세를 못 받으면 목록에서 아는 정보(제목·분류·상태·작성일)로 대신 그리고 이유를 알린다.
  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setLoadError(null);
    fetchInquiryDetail(inquiryId)
      .then((detail) => {
        if (alive) setInquiry(detail);
      })
      .catch((err) => {
        if (alive) setLoadError(inquiryDetailErrorKind(err));
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [inquiryId, reloadKey]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // 삭제는 ID 만 있으면 되므로 상세를 못 받아도 할 수 있다
      await deleteInquiry(inquiryId);
      toast.success('문의가 삭제되었어요.');
      onDeleted();
    } catch {
      toast.error('삭제에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const summary = inquiry ?? (loadError ? fallbackItem : null);
  const isPending = summary?.status === 'PENDING';
  const canDelete = !isAdmin && isPending;
  // 수정 폼은 본문·첨부 이미지가 있어야 채울 수 있다 — 상세를 받았을 때만 연다
  const canEdit = canDelete && inquiry !== null;

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button onClick={onBack} className="p-2 -ml-2 text-gray-700 rounded-full active:bg-gray-100">
              <ArrowLeft size={24} />
            </button>
            <span className="font-bold text-lg ml-2">문의 상세</span>
          </div>
          {canDelete && (
            <div className="flex gap-1">
              {canEdit && inquiry && (
                <button
                  onClick={() => onEdit(inquiry)}
                  className="p-2 text-gray-500 rounded-full active:bg-gray-100"
                >
                  <Pencil size={18} />
                </button>
              )}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-red-400 rounded-full active:bg-red-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-5 space-y-4">
            <div className="flex gap-2">
              <div className="h-5 w-14 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
            </div>
            <div className="h-6 w-2/3 bg-gray-100 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ) : !inquiry ? (
          <div className="p-5">
            {summary && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium bg-primary-50 text-primary-600 rounded-full px-2 py-0.5">
                    {summary.categoryName}
                  </span>
                  <span
                    className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                      isPending ? 'bg-accent-50 text-accent-500' : 'bg-primary-50 text-primary-600'
                    }`}
                  >
                    {INQUIRY_STATUS_LABELS[summary.status]}
                  </span>
                </div>
                <h2 className="font-bold text-base text-gray-900 mb-1">{summary.title}</h2>
                {isAdmin && summary.authorNickname && (
                  <p className="text-xs text-gray-400 mb-1">작성자: {summary.authorNickname}</p>
                )}
                <p className="text-xs text-gray-400 mb-4">{formatDate(summary.createdAt)}</p>
              </>
            )}
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 font-medium">
                {loadError === 'notFound'
                  ? '삭제되었거나 없는 문의예요'
                  : loadError === 'forbidden'
                    ? '이 문의는 볼 수 없어요'
                    : '문의 내용을 불러오지 못했어요'}
              </p>
              {loadError === 'retryable' && (
                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="mt-3 px-3 py-1.5 text-xs font-bold text-primary-600 bg-primary-50 rounded-full active:scale-95 transition-transform"
                >
                  다시 시도
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium bg-primary-50 text-primary-600 rounded-full px-2 py-0.5">
                {inquiry.categoryName}
              </span>
              <span
                className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                  isPending ? 'bg-accent-50 text-accent-500' : 'bg-primary-50 text-primary-600'
                }`}
              >
                {INQUIRY_STATUS_LABELS[inquiry.status]}
              </span>
            </div>

            <h2 className="font-bold text-base text-gray-900 mb-1">{inquiry.title}</h2>
            {isAdmin && inquiry.authorNickname && (
              <p className="text-xs text-gray-400 mb-1">작성자: {inquiry.authorNickname}</p>
            )}
            <p className="text-xs text-gray-400 mb-4">{formatDate(inquiry.createdAt)}</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {inquiry.content}
              </p>
            </div>

            {inquiry.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {inquiry.images.map((img) => (
                  <a
                    key={img.imageId}
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={img.url}
                      alt="첨부 이미지"
                      fill
                      sizes="33vw"
                      className="object-cover"
                      unoptimized
                    />
                  </a>
                ))}
              </div>
            )}

            {inquiry.answer && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-primary-500 rounded-full" />
                  <span className="text-sm font-bold text-gray-700">운영팀 답변</span>
                </div>
                <div className="bg-primary-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                    {inquiry.answer.content}
                  </p>
                  <p className="text-xs text-gray-400">
                    {inquiry.answer.answeredBy} · {formatDate(inquiry.answer.answeredAt)}
                  </p>
                </div>
              </div>
            )}

            {!inquiry.answer && isPending && (
              <div className="bg-accent-50 rounded-xl p-4 text-center">
                <p className="text-sm text-accent-500 font-medium">답변 대기 중이에요</p>
                <p className="text-xs text-accent-400 mt-1">영업일 기준 1~3일 내로 답변드릴게요.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-y-0 app-frame bg-black/50 z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[300px]">
            <h2 className="font-bold text-lg text-gray-900 mb-2">문의를 삭제하시겠어요?</h2>
            <p className="text-sm text-gray-500 mb-5">삭제한 문의는 복구할 수 없어요.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-gray-100 font-bold rounded-xl text-sm text-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 font-bold rounded-xl text-sm text-white disabled:bg-gray-300"
              >
                {isDeleting ? '삭제 중...' : '삭제하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
