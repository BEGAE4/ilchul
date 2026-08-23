'use client';

import { useRouter } from 'next/navigation';
import PageLayout from '@/shared/ui/PageLayout';
import Header from '@/shared/ui/Header';
import styles from './styles.module.scss';

/**
 * 받은 제재 목록.
 * 사용자용 제재 목록 조회 API가 아직 없어(관리자 전용 endpoint만 존재)
 * 안내 상태만 렌더링한다.
 */
export function MySanctionsPage() {
  const router = useRouter();

  return (
    <PageLayout>
      <Header variant="backArrow" onBackClick={() => router.back()} />

      <div className={styles.content}>
        <h1 className={styles.pageTitle}>받은 제재</h1>

        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🛡️</span>
          <p className={styles.emptyText}>아직 제공되지 않는 기능이에요</p>
        </div>

        <p className={styles.footerNote}>
          제재 내역 조회와 이의제기 기능은 곧 제공될 예정이에요.
        </p>
      </div>
    </PageLayout>
  );
}
