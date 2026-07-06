'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { createInquiry, updateInquiry, fetchInquiryCategories } from '../api/inquiry.api';
import type {
  InquiryCategory,
  InquiryDetail,
  InquiryImage,
  InquiryType,
} from '../types/inquiry.types';
import { INQUIRY_TYPE_CATEGORY_ID, INQUIRY_TYPE_LABELS } from '../types/inquiry.types';

interface InquiryFormSectionProps {
  mode: 'create' | 'edit';
  existingInquiry?: InquiryDetail;
  onSuccess: (inquiry: InquiryDetail) => void;
  onCancel: () => void;
}

const MAX_CONTENT = 500;
const MAX_TITLE = 50;
const MAX_IMAGES = 5;

interface LocalImage {
  file: File;
  previewUrl: string;
}

export const InquiryFormSection = ({
  mode,
  existingInquiry,
  onSuccess,
  onCancel,
}: InquiryFormSectionProps) => {
  const [categories, setCategories] = useState<InquiryCategory[]>([]);
  const [inquiryType, setInquiryType] = useState<InquiryType>(
    existingInquiry?.inquiryType ?? 'GENERAL'
  );
  const [title, setTitle] = useState(existingInquiry?.title ?? '');
  const [content, setContent] = useState(existingInquiry?.content ?? '');

  // 기존 이미지(수정 모드) + 삭제 대상 + 새로 추가한 이미지
  const [existingImages, setExistingImages] = useState<InquiryImage[]>(
    existingInquiry?.images ?? []
  );
  const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<LocalImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInquiryCategories()
      .then((list) => {
        if (list.length > 0) setCategories(list);
      })
      .catch(() => {
        // 카테고리 조회 실패 시 라벨 상수로 폴백
        setCategories(
          (Object.keys(INQUIRY_TYPE_LABELS) as InquiryType[]).map((slug) => ({
            slug,
            name: INQUIRY_TYPE_LABELS[slug],
          }))
        );
      });
  }, []);

  // 새 이미지 미리보기 URL 정리
  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [newImages]);

  const imageCount = existingImages.length + newImages.length;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - imageCount;
    if (remaining <= 0) {
      toast.info(`이미지는 최대 ${MAX_IMAGES}장까지 첨부할 수 있어요.`);
      return;
    }
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, remaining)
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setNewImages((prev) => [...prev, ...picked]);
  };

  const removeNewImage = (idx: number) => {
    setNewImages((prev) => {
      const target = prev[idx];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeExistingImage = (imageId: number) => {
    setExistingImages((prev) => prev.filter((img) => img.imageId !== imageId));
    setDeleteImageIds((prev) => [...prev, imageId]);
  };

  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const categoryId = INQUIRY_TYPE_CATEGORY_ID[inquiryType];
      let result: InquiryDetail;
      if (mode === 'create') {
        result = await createInquiry({
          title: title.trim(),
          content: content.trim(),
          categoryId,
          inquiryType,
          images: newImages.map((i) => i.file),
        });
        toast.success('문의가 등록되었어요.');
      } else {
        result = await updateInquiry(existingInquiry!.inquiryId, {
          title: title.trim(),
          content: content.trim(),
          categoryId,
          inquiryType,
          images: newImages.map((i) => i.file),
          deleteImageIds: deleteImageIds.length > 0 ? deleteImageIds : undefined,
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
          <label className="block text-sm font-bold text-gray-500 mb-2">유형</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setInquiryType(cat.slug)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  inquiryType === cat.slug
                    ? 'bg-sky-500 text-white'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                {cat.name}
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

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">
            이미지 첨부 <span className="text-gray-400 font-normal">({imageCount}/{MAX_IMAGES})</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <div className="grid grid-cols-3 gap-2">
            {existingImages.map((img) => (
              <div key={img.imageId} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image src={img.url} alt="첨부 이미지" fill sizes="33vw" className="object-cover" unoptimized />
                <button
                  onClick={() => removeExistingImage(img.imageId)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {newImages.map((img, idx) => (
              <div key={img.previewUrl} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image src={img.previewUrl} alt="첨부 미리보기" fill sizes="33vw" className="object-cover" unoptimized />
                <button
                  onClick={() => removeNewImage(idx)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {imageCount < MAX_IMAGES && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 active:bg-gray-50"
              >
                <ImagePlus size={22} />
                <span className="text-xs mt-1">추가</span>
              </button>
            )}
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
