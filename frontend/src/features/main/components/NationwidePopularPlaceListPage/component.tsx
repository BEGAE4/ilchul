'use client';

import { useRouter } from 'next/navigation';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useNationwidePopularPlaces } from '../../hooks/useNationwidePopularPlaces';
import { ListPageShell } from '../ListPageShell';
import { PopularPlaceCard } from '../PopularPlaceCard';
import styles from './styles.module.scss';

export function NationwidePopularPlaceListPage() {
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
  } = useNationwidePopularPlaces();

  const sentinelRef = useInfiniteScroll({
    enabled: hasNext && !isLoadingMore && !error,
    onIntersect: loadMore,
  });

  return (
    <ListPageShell
      title="전국 인기 장소"
      totalCount={totalCount}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasNext={hasNext}
      error={error}
      isEmpty={items.length === 0}
      sentinelRef={sentinelRef}
      onRetry={retry}
    >
      <div className={styles.grid}>
        {items.map((place) => (
          <PopularPlaceCard
            key={place.id}
            place={place}
            onClick={() => router.push(`/place/${place.id}`)}
          />
        ))}
      </div>
    </ListPageShell>
  );
}
