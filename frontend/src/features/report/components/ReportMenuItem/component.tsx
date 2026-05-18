'use client';

import { Flag } from 'lucide-react';
import { useReportEligibility } from '../../hooks/useReportEligibility';
import type { ReportMenuItemProps } from './types';
import styles from './styles.module.scss';

export function ReportMenuItem({ target, currentUser, onSelect }: ReportMenuItemProps) {
  const { canShow, disabled, reason } = useReportEligibility({ currentUser, target });

  // 비로그인 또는 자기 신고 — 비노출 (Q4 결정)
  if (!canShow && (reason === 'NOT_LOGGED_IN' || reason === 'SELF_REPORT')) {
    return null;
  }

  const isAlreadyReported = reason === 'ALREADY_REPORTED';
  const label = isAlreadyReported ? '이미 신고함' : '신고하기';

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        onSelect();
      }}
      disabled={disabled}
      className={`${styles.item} ${disabled ? styles['item--disabled'] : ''}`}
      aria-label={label}
    >
      <span className={styles.icon} aria-hidden="true">
        <Flag size={16} />
      </span>
      <span className={`${styles.label} ${isAlreadyReported ? styles['label--disabled'] : ''}`}>
        {label}
      </span>
    </button>
  );
}
