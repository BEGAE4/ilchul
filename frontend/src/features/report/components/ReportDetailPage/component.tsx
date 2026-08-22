'use client';

import { useRouter } from 'next/navigation';
import PageLayout from '@/shared/ui/PageLayout';
import Header from '@/shared/ui/Header';
import type { ReportDetail } from '../../types';
import {
  REASON_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_RESOLUTION_LABELS,
} from '../../types';
import styles from './styles.module.scss';

const MOCK_REPORT: ReportDetail = {
  reportId: 'r-1024',
  target: {
    type: 'course',
    id: '27',
    ownerId: '힙스터김',
    title: '성수동 힙플레이스 완전 정복',
    contextUrl: '/course/27',
  },
  reasonCode: 'FAKE_INFO',
  detail: '장소 정보가 실제와 달라요.',
  status: 'REVIEWING',
  createdAt: '2026-05-18T12:30:00Z',
  updatedAt: '2026-05-19T09:15:00Z',
  history: [
    { status: 'PENDING', at: '2026-05-18T12:30:00Z', actor: 'system' },
    { status: 'REVIEWING', at: '2026-05-19T09:15:00Z', actor: 'operator' },
  ],
  resolution: null,
};

const TARGET_TYPE_LABELS: Record<string, string> = {
  course: '코스',
  comment: '댓글',
  user: '사용자',
};

function getTargetTitle(target: ReportDetail['target']): string {
  if (target.type === 'course') return target.title;
  if (target.type === 'user') return target.nickname;
  return target.snippet?.slice(0, 40) ?? '';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

interface Props {
  reportId: string;
}

export function ReportDetailPage({ reportId: _ }: Props) {
  const router = useRouter();
  const report = MOCK_REPORT; // TODO: API 연동 시 reportId로 조회

  const targetTitle = getTargetTitle(report.target);

  return (
    <PageLayout>
      <Header variant="backArrow" onBackClick={() => router.back()} />

      <div className={styles.content}>
        <h1 className={styles.pageTitle}>신고 현황</h1>

        {/* 처리 상태 */}
        <section className={styles.section}>
          <div className={styles.statusRow}>
            <span className={`${styles.statusBadge} ${styles[`status__${report.status.toLowerCase()}`]}`}>
              {REPORT_STATUS_LABELS[report.status]}
            </span>
            <span className={styles.updatedAt}>최근 업데이트 {formatDate(report.updatedAt)}</span>
          </div>
        </section>

        {/* 신고 대상 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>신고 대상</h2>
          <div className={styles.targetCard}>
            <span className={styles.targetTypeBadge}>{TARGET_TYPE_LABELS[report.target.type]}</span>
            <span className={styles.targetTitle}>{targetTitle}</span>
          </div>
        </section>

        {/* 신고 사유 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>신고 사유</h2>
          <p className={styles.reasonText}>{REASON_LABELS[report.reasonCode]}</p>
          {report.detail && (
            <p className={styles.detailText}>{report.detail}</p>
          )}
        </section>

        {/* 처리 이력 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>처리 이력</h2>
          <div className={styles.timeline}>
            {report.history.map((item, idx) => (
              <div key={idx} className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${idx === report.history.length - 1 ? styles['timelineDot--active'] : ''}`} />
                {idx < report.history.length - 1 && <div className={styles.timelineLine} />}
                <div className={styles.timelineBody}>
                  <span className={styles.timelineStatus}>{REPORT_STATUS_LABELS[item.status]}</span>
                  <span className={styles.timelineDate}>{formatDate(item.at)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 처리 결과 */}
        {report.resolution && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>처리 결과</h2>
            <div className={styles.resolutionCard}>
              <p className={styles.resolutionText}>{REPORT_RESOLUTION_LABELS[report.resolution]}</p>
            </div>
          </section>
        )}

        <p className={styles.footerNote}>
          신고는 접수 후 24시간 내 검토됩니다. 처리 결과는 본 화면에서 확인할 수 있어요.
        </p>
      </div>
    </PageLayout>
  );
}
