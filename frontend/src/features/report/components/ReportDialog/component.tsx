'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { REASONS_BY_TARGET } from '../../utils/reasonsByTarget';
import { REASON_LABELS } from '../../types/report';
import type { ReportReasonCode } from '../../types';
import type { ReportDialogProps } from './types';
import styles from './styles.module.scss';

export function ReportDialog({
  isOpen,
  target,
  isSubmitting = false,
  triggerRef,
  onSubmit,
  onClose,
  onSubmitted,
  onHideContent,
}: ReportDialogProps) {
  const [step, setStep] = useState<'input' | 'done'>('input');
  const [reasonCode, setReasonCode] = useState<ReportReasonCode | null>(null);
  const [detail, setDetail] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [displayLength, setDisplayLength] = useState(0);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstRadioRef = useRef<HTMLInputElement>(null);

  // isOpen이 false→true 전이 시 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setReasonCode(null);
      setDetail('');
      setDisplayLength(0);
      setSubmittedReportId(null);
    }
  }, [isOpen]);

  // 열릴 때 첫 라디오에 포커스
  useEffect(() => {
    if (isOpen && step === 'input') {
      const timer = setTimeout(() => {
        firstRadioRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, step]);

  // 닫힐 때 triggerRef로 포커스 복귀
  useEffect(() => {
    if (!isOpen) {
      triggerRef?.current?.focus();
    }
  }, [isOpen, triggerRef]);

  // 키보드 회피 — visualViewport 리스너
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const update = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      sheetRef.current?.style.setProperty('--keyboard-offset', `${Math.max(0, offset)}px`);
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [isOpen]);

  // body overflow 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 포커스 트랩
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'input, textarea, button:not([disabled])'
    );
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: 첫 요소에서 마지막으로 wrap
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: 마지막 요소에서 첫 요소로 wrap
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  async function handleSubmit() {
    if (!reasonCode) return;

    try {
      const res = await onSubmit(reasonCode, detail);

      if (res.alreadyReported) {
        toast('이미 신고한 콘텐츠예요.');
        onClose();
        return;
      }

      onSubmitted?.(res, target);
      setSubmittedReportId(res.reportId ?? null);
      setStep('done');
    } catch (err) {
      const message = (err as Error)?.message;
      if (message === 'ETC_DETAIL_REQUIRED') {
        toast.error('직접 입력 사유는 필수예요');
        return;
      }
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        toast.error('신고가 일시 제한됐어요. 잠시 후 다시 시도해주세요.');
      } else {
        toast.error('일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
      }
    }
  }

  function handleHideContent() {
    onHideContent?.(target);
    onClose();
  }

  function handleDetailChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDetail(e.target.value);
    // composition 중에는 카운터 업데이트 보류
    if (!isComposing) {
      setDisplayLength(e.target.value.length);
    }
  }

  const reasons = REASONS_BY_TARGET[target.type];

  const isSubmitDisabled =
    !reasonCode ||
    (reasonCode === 'ETC' && !detail.trim()) ||
    isSubmitting;

  const textareaPlaceholder =
    reasonCode === 'ETC'
      ? '신고 사유를 직접 입력해주세요 (필수)'
      : '상세 내용은 선택 입력이에요';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* 시트 */}
          <motion.div
            ref={sheetRef}
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-dialog-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onKeyDown={handleKeyDown}
          >
            <div ref={dialogRef}>
              {/* 핸들바 */}
              <div className={styles.handle} aria-hidden="true" />

              {step === 'input' ? (
                <>
                  {/* Step 1: 입력 */}
                  <div className={styles.header}>
                    <h2 id="report-dialog-title" className={styles.title}>
                      신고하기
                    </h2>
                    <button
                      onClick={onClose}
                      className={styles.closeBtn}
                      aria-label="닫기"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className={styles.body}>
                    <p className={styles.description}>
                      신고 사유를 선택해주세요. 상세 내용은 선택 입력이에요.
                    </p>

                    {/* 라디오 사유 그룹 */}
                    <div
                      role="radiogroup"
                      aria-label="신고 사유"
                      className={styles.radioGroup}
                    >
                      {reasons.map((code, idx) => {
                        const isSelected = reasonCode === code;
                        return (
                          <label
                            key={code}
                            className={`${styles.radioOption} ${isSelected ? styles['radioOption--selected'] : ''}`}
                          >
                            <input
                              ref={idx === 0 ? firstRadioRef : undefined}
                              type="radio"
                              name="report-reason"
                              value={code}
                              checked={isSelected}
                              onChange={() => setReasonCode(code)}
                              className={styles.radioInput}
                            />
                            <span className={styles.radioLabel}>
                              {REASON_LABELS[code]}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {/* 상세 입력 */}
                    <div className={styles.textareaWrapper}>
                      <textarea
                        value={detail}
                        onChange={handleDetailChange}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={(e) => {
                          setIsComposing(false);
                          setDisplayLength((e.target as HTMLTextAreaElement).value.length);
                        }}
                        placeholder={textareaPlaceholder}
                        rows={3}
                        maxLength={500}
                        className={styles.textarea}
                        aria-label="신고 상세 내용"
                      />
                    </div>
                    <p className={styles.counter}>{displayLength}/500</p>
                  </div>

                  <div className={styles.footer}>
                    <p className={styles.footerNote}>
                      신고자 정보는 상대방에게 공개되지 않아요.
                    </p>
                    <div className={styles.buttonGroup}>
                      <button
                        type="button"
                        onClick={onClose}
                        className={styles.cancelBtn}
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                        className={styles.submitBtn}
                      >
                        {isSubmitting ? '제출 중...' : '신고하기'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Step 2: 완료 */}
                  <div className={styles.header}>
                    <h2 id="report-dialog-title" className={styles.title}>
                      신고가 접수됐어요. 검토 후 조치할게요.
                    </h2>
                  </div>

                  <div className={styles.doneBody}>
                    <div className={styles.doneIcon} aria-hidden="true">
                      <CheckCircle size={28} />
                    </div>
                    <p className={styles.doneDescription}>
                      신고해주셔서 감사해요.
                      <br />
                      불편하셨다면 이 콘텐츠를 숨길 수 있어요.
                    </p>
                  </div>

                  <div className={styles.footer}>
                    <div className={styles.doneButtonGroup}>
                      <button
                        type="button"
                        onClick={handleHideContent}
                        className={styles.hideBtn}
                      >
                        이 콘텐츠 숨기기
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className={styles.closeOnlyBtn}
                      >
                        닫기
                      </button>
                    </div>
                    {submittedReportId && (
                      <Link
                        href={`/my-page/reports/${submittedReportId}`}
                        className={styles.reportDetailLink}
                        onClick={onClose}
                      >
                        신고 현황 보기 →
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
