'use client';

import { useRouter } from 'next/navigation';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useNationwidePopularPlans } from '../../hooks/useNationwidePopularPlans';
import { ListPageShell } from '../ListPageShell';
import { PopularPlanCard } from '../PopularPlanCard';
import styles from './styles.module.scss';

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
  } = useNationwidePopularPlans();

  const sentinelRef = useInfiniteScroll({
    enabled: hasNext && !isLoadingMore && !error,
    onIntersect: loadMore,
  });

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
            key={plan.id}
            plan={plan}
            onClick={() => router.push(`/course/${plan.id}`)}
          />
        ))}
      </div>
    </ListPageShell>
  );
}
