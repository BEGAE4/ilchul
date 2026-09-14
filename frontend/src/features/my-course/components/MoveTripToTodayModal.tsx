'use client';

import { Loader2 } from 'lucide-react';
import { STAMP_COPY } from '../constants/stampCopy';

interface MoveTripToTodayModalProps {
  /** 안내 문구 — 호출부가 기존 일정 유무에 따라 만든다 */
  description: string;
  isSaving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// 여행 날이 아닐 때 '여기 왔다면 오늘 기록하기'를 누르면 뜨는 확인창.
// 일정을 오늘로 옮긴 뒤 기억 스탬프 모달로 이어진다 (MyCourseDetailPage).
export function MoveTripToTodayModal({ description, isSaving, onConfirm, onCancel }: MoveTripToTodayModalProps) {
  return (
    <div className="fixed inset-y-0 app-frame z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => !isSaving && onCancel()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-trip-title"
        className="relative w-full max-w-xs bg-white rounded-2xl p-5"
      >
        <h3 id="move-trip-title" className="font-bold text-lg mb-1">
          {STAMP_COPY.moveModal.title}
        </h3>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">{description}</p>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-200 disabled:opacity-60 mb-2"
        >
          {isSaving && <Loader2 size={16} className="animate-spin" />}
          {isSaving ? STAMP_COPY.moveModal.saving : STAMP_COPY.moveModal.confirm}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full text-gray-400 font-bold text-sm py-2"
        >
          {STAMP_COPY.moveModal.cancel}
        </button>
      </div>
    </div>
  );
}
