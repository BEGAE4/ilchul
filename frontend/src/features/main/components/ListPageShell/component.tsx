'use client';

import { useRouter } from 'next/navigation';
import Header from '@/shared/ui/Header';
import PageLayout from '@/shared/ui/PageLayout';
import type { ListPageShellProps } from './types';
import styles from './styles.module.scss';

export function ListPageShell({
  title,
  totalCount,
  isLoading,
  isLoadingMore,
  hasNext,
  error,
  isEmpty,
  sentinelRef,
  onRetry,
  children,
}: ListPageShellProps) {
  const router = useRouter();

  return (
    <PageLayout>
      <Header
        variant="backArrow"
        title={title}
        onBackClick={() => router.back()}
      />
      <div className={styles.body}>
        {totalCount > 0 && !isLoading && !error && (
          <div className={styles.totalCount}>
            총{' '}
            <span className={styles.totalCountNumber}>
              {totalCount.toLocaleString()}
            </span>
            건
          </div>
        )}

        {isLoading && <div className={styles.loading}>불러오는 중...</div>}

        {!isLoading && error && (
          <div className={styles.error}>
            <p>결과를 불러오지 못했습니다.</p>
            <button
              type="button"
              onClick={onRetry}
              className={styles.retryButton}
            >
              다시 시도
            </button>
          </div>
        )}

        {!isLoading && !error && isEmpty && (
          <div className={styles.empty}>표시할 결과가 없습니다.</div>
        )}

        {!isLoading && !error && !isEmpty && (
          <>
            {children}
            <div ref={sentinelRef} className={styles.sentinel} />
            {isLoadingMore && (
              <div className={styles.loadingMore}>더 불러오는 중...</div>
            )}
            {!hasNext && !isLoadingMore && (
              <div className={styles.endMessage}>마지막 결과입니다.</div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
