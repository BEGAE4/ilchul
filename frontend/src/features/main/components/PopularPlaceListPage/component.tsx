'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useNearbyPopularPlaces } from '../../hooks/useNearbyPopularPlaces';
import { ListPageShell } from '../ListPageShell';
import { PopularPlaceCard } from '../PopularPlaceCard';
import styles from './styles.module.scss';

export function PopularPlaceListPage() {
  const router = useRouter();
  const geo = useGeolocation();

  useEffect(() => {
    if (geo.status === 'denied' || geo.status === 'unsupported') {
      router.replace('/place/popular/nationwide');
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
  } = useNearbyPopularPlaces({
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
      title="내 주변 인기 장소"
      totalCount={totalCount}
      isLoading={showShellLoading}
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
