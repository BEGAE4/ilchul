import { useMemo, useState } from 'react';
import { submitReport } from '../api/report.api';
import { markReported } from '../utils/hiddenReportsStorage';
import type { ReportReasonCode, ReportResponse, ReportTarget } from '../types';

interface UseReportOptions {
  // 호출부에서 주입 — useUserStore 직접 결합 회피 (Architect C-2)
  reporterId: string;
}

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

export function useReport({ reporterId }: UseReportOptions): UseReportResult {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<ReportTarget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 훅 마운트 시 1회 생성. idempotency-key 용도라 보안 강도는 중요치 않음.
  // crypto.randomUUID()는 secure context(HTTPS/localhost)에서만 동작하므로 폴백 제공.
  const attemptId = useMemo<string>(() => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // secure context 외 환경(HTTP dev) 폴백 — idempotency-key 용도라 충분
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }, []);

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
      const response = await submitReport(
        { target: submitTarget, reasonCode, detail },
        { reporterId, attemptId }
      );

      // 성공 시 단일 소스(hiddenReportsStorage) 갱신 (Architect M-3)
      markReported(submitTarget);

      return response;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { isOpen, target, isSubmitting, open, close, submit };
}
