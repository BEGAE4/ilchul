'use client';

import { useRouter } from 'next/navigation';
import PageLayout from '@/shared/ui/PageLayout';
import Header from '@/shared/ui/Header';
import styles from './styles.module.scss';

interface Props {
  // 신고 상세 API 연동 시 조회 키로 사용 예정
  reportId: string;
}

/**
 * 내 신고 현황 상세.
 * 사용자용 신고 상세 조회 API가 아직 없어(신고 접수 POST /api/report 만 제공)
 * 안내 상태만 렌더링한다.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ReportDetailPage({ reportId }: Props) {
  const router = useRouter();

  return (
    <PageLayout>
      <Header variant="backArrow" onBackClick={() => router.back()} />

      <div className={styles.content}>
        <h1 className={styles.pageTitle}>신고 현황</h1>

        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🚧</span>
          <p className={styles.emptyText}>아직 제공되지 않는 기능이에요</p>
        </div>

        <p className={styles.footerNote}>
          접수된 신고는 24시간 내 검토됩니다.
          <br />
          처리 결과 조회 기능은 곧 제공될 예정이에요.
        </p>
      </div>
    </PageLayout>
  );
}
