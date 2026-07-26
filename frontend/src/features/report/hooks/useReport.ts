import { useState } from 'react';
import { submitReport } from '../api/report.api';
import { markReported } from '../utils/hiddenReportsStorage';
import type { ReportReasonCode, ReportResponse, ReportTarget } from '../types';

interface UseReportResult {
  isOpen: boolean;
  target: ReportTarget | null;
  isSubmitting: boolean;
  open: (target: ReportTarget) => void;
  close: () => void;
  submit: (
    target: ReportTarget, // 명시 전달 (Architect C-3: race condition 차단)
    reasonCode: ReportReasonCode,
    detail?: string
  ) => Promise<ReportResponse>;
}

export function useReport(): UseReportResult {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<ReportTarget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function open(newTarget: ReportTarget): void {
    setTarget(newTarget);
    setIsOpen(true);
  }

  function close(): void {
    setIsOpen(false);
    setTarget(null);
  }

  async function submit(
    submitTarget: ReportTarget,
    reasonCode: ReportReasonCode,
    detail?: string
  ): Promise<ReportResponse> {
    // ETC 사유 선택 시 detail 필수 — 토스트는 호출부(PR-3)에서 처리
    if (reasonCode === 'ETC' && (!detail || !detail.trim())) {
      return Promise.reject(new Error('ETC_DETAIL_REQUIRED'));
    }

    if (isSubmitting) {
      return Promise.reject(new Error('SUBMIT_IN_PROGRESS'));
    }

    setIsSubmitting(true);
    try {
      const response = await submitReport({ target: submitTarget, reasonCode, detail });

      // 성공 시 단일 소스(hiddenReportsStorage) 갱신 (Architect M-3)
      markReported(submitTarget);

      return response;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { isOpen, target, isSubmitting, open, close, submit };
}
