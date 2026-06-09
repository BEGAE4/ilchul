'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useNearbyPopularPlans } from '../../hooks/useNearbyPopularPlans';
import { ListPageShell } from '../ListPageShell';
import { PopularPlanCard } from '../PopularPlanCard';
import styles from './styles.module.scss';

export function PopularPlanListPage() {
  const router = useRouter();
  const geo = useGeolocation();

  useEffect(() => {
    if (geo.status === 'denied' || geo.status === 'unsupported') {
      router.replace('/plan/popular/nationwide');
    }
  }, [geo.status, router]);

  const {
    items,
    isLoading,
    isLoadingMore,
    error,
    hasNext,
    totalCount,
    loadMore,
    retry,
  } = useNearbyPopularPlans({
    lat: geo.coords?.lat ?? null,
    lng: geo.coords?.lng ?? null,
  });

  const sentinelRef = useInfiniteScroll({
    enabled: hasNext && !isLoadingMore && !error,
    onIntersect: loadMore,
  });

  const showShellLoading =
    isLoading || geo.status === 'idle' || geo.status === 'loading';

  return (
    <ListPageShell
      title="내 주변 실시간 베스트 플랜"
      totalCount={totalCount}
      isLoading={showShellLoading}
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
