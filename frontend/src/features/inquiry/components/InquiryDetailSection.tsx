'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchInquiryDetail, deleteInquiry } from '../api/inquiry.api';
import type { InquiryDetail } from '../types/inquiry.types';
import { INQUIRY_STATUS_LABELS } from '../types/inquiry.types';

interface InquiryDetailSectionProps {
  inquiryId: number;
  isAdmin?: boolean;
  onBack: () => void;
  onEdit: (inquiry: InquiryDetail) => void;
  onDeleted: () => void;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const InquiryDetailSection = ({
  inquiryId,
  isAdmin = false,
  onBack,
  onEdit,
  onDeleted,
}: InquiryDetailSectionProps) => {
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchInquiryDetail(inquiryId)
      .then(setInquiry)
      .finally(() => setIsLoading(false));
  }, [inquiryId]);

  const handleDelete = async () => {
    if (!inquiry) return;
    setIsDeleting(true);
    try {
      await deleteInquiry(inquiry.inquiryId);
      toast.success('문의가 삭제되었어요.');
      onDeleted();
    } catch {
      toast.error('삭제에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const isPending = inquiry?.status === 'PENDING';
  const canEdit = !isAdmin && isPending;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button onClick={onBack} className="p-2 -ml-2 text-gray-700 rounded-full active:bg-gray-100">
              <ArrowLeft size={24} />
            </button>
            <span className="font-bold text-lg ml-2">문의 상세</span>
          </div>
          {canEdit && inquiry && (
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(inquiry)}
                className="p-2 text-gray-500 rounded-full active:bg-gray-100"
              >
                <Pencil size={18} />
              </button>
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
        {isLoading || !inquiry ? (
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
        ) : (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium bg-sky-50 text-sky-600 rounded-full px-2 py-0.5">
                {inquiry.categoryName}
              </span>
              <span
                className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                  isPending ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-600'
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
                  <div className="w-1 h-4 bg-sky-500 rounded-full" />
                  <span className="text-sm font-bold text-gray-700">운영팀 답변</span>
                </div>
                <div className="bg-sky-50 rounded-xl p-4">
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
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <p className="text-sm text-orange-500 font-medium">답변 대기 중이에요</p>
                <p className="text-xs text-orange-400 mt-1">영업일 기준 1~3일 내로 답변드릴게요.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
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
