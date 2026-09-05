'use client';

import { useRouter } from 'next/navigation';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useNationwidePopularPlaces } from '../../hooks/useNationwidePopularPlaces';
import { useScrollRestoration } from '@/shared/hooks/useScrollRestoration';
import { ListPageShell } from '../ListPageShell';
import { PopularPlaceCard } from '../PopularPlaceCard';
import styles from './styles.module.scss';

const CACHE_KEY = 'place-popular-nationwide';

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
  } = useNationwidePopularPlaces({ cacheKey: CACHE_KEY });

  const sentinelRef = useInfiniteScroll({
    enabled: hasNext && !isLoadingMore && !error,
    onIntersect: loadMore,
  });

  // 목록 → 상세 → 뒤로가기 시 스크롤 위치 복원
  useScrollRestoration(CACHE_KEY, !isLoading && items.length > 0);

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
