'use client';

import { useRouter } from 'next/navigation';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useNationwidePopularPlans } from '../../hooks/useNationwidePopularPlans';
import { useScrollRestoration } from '@/shared/hooks/useScrollRestoration';
import { ListPageShell } from '../ListPageShell';
import { PopularPlanCard } from '../PopularPlanCard';
import styles from './styles.module.scss';

const CACHE_KEY = 'plan-popular-nationwide';

export function NationwidePopularPlanListPage() {
  const router = useRouter();

  const {
    items,
    isLoading,
    isLoadingMore,
    error,
    hasNext,
    totalCount,
    loadMore,
    retry,
  } = useNationwidePopularPlans({ cacheKey: CACHE_KEY });

  const sentinelRef = useInfiniteScroll({
    enabled: hasNext && !isLoadingMore && !error,
    onIntersect: loadMore,
  });

  // 목록 → 상세 → 뒤로가기 시 스크롤 위치 복원
  useScrollRestoration(CACHE_KEY, !isLoading && items.length > 0);

  return (
    <ListPageShell
      title="전국 인기 플랜"
      totalCount={totalCount}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasNext={hasNext}
      error={error}
      isEmpty={items.length === 0}
      sentinelRef={sentinelRef}
      onRetry={retry}
    >
      <div className={styles.list}>
        {items.map((plan) => (
          <PopularPlanCard
            key={String(plan.id)}
            plan={plan}
            onClick={() => router.push(`/course/${plan.id}`)}
          />
        ))}
      </div>
    </ListPageShell>
  );
}
