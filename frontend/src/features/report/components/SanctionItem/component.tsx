'use client';

import type { Sanction, SanctionType } from '../../types';
import { SANCTION_TYPE_LABELS, REASON_LABELS } from '../../types';
import styles from './styles.module.scss';

const TYPE_CLASS: Record<SanctionType, string> = {
  WARNING: styles['badge--warning'],
  CONTENT_BLINDED: styles['badge--blinded'],
  TEMP_BAN: styles['badge--tempban'],
  PERMANENT_BAN: styles['badge--permban'],
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function getDDay(expiresAt: string): string {
  const diff = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return '종료됨';
  if (diff === 1) return 'D-1 후 종료';
  return `D-${diff} 후 종료`;
}

function getSanctionTargetLabel(target: Sanction['target']): string {
  if (target.type === 'course') return target.title;
  if (target.type === 'user') return target.nickname;
  return target.snippet?.slice(0, 30) ?? '';
}

const TARGET_TYPE_LABELS: Record<string, string> = {
  course: '코스',
  comment: '댓글',
  user: '사용자',
};

interface Props {
  sanction: Sanction;
}

export function SanctionItem({ sanction }: Props) {
  const targetLabel = getSanctionTargetLabel(sanction.target);

  return (
    <div className={`${styles.card} ${sanction.isActive ? styles['card--active'] : ''}`}>
      <div className={styles.cardHeader}>
        <span className={`${styles.typeBadge} ${TYPE_CLASS[sanction.type]}`}>
          {SANCTION_TYPE_LABELS[sanction.type]}
        </span>
        <span className={`${styles.activeBadge} ${sanction.isActive ? styles['activeBadge--on'] : styles['activeBadge--off']}`}>
          {sanction.isActive ? '진행 중' : '종료'}
        </span>
      </div>

      <div className={styles.target}>
        <span className={styles.targetType}>{TARGET_TYPE_LABELS[sanction.target.type]}</span>
        <span className={styles.targetTitle}>{targetLabel}</span>
      </div>

      <p className={styles.message}>{sanction.message}</p>

      <div className={styles.meta}>
        <span className={styles.metaItem}>사유: {REASON_LABELS[sanction.reasonCode]}</span>
        <span className={styles.metaItem}>발효: {formatDate(sanction.issuedAt)}</span>
        {sanction.expiresAt ? (
          <span className={styles.metaItem}>
            종료: {formatDate(sanction.expiresAt)}
            {sanction.isActive && (
              <span className={styles.dday}>{getDDay(sanction.expiresAt)}</span>
            )}
          </span>
        ) : (
          <span className={styles.metaItem}>종료: 영구</span>
        )}
      </div>

      <button className={styles.appealBtn} disabled>
        이의제기 <span className={styles.appealNote}>준비 중이에요</span>
      </button>
    </div>
  );
}
