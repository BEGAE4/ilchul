'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRegion } from '../../hooks/useRegion';
import { buildNearbyQuery } from '../../utils/nearbyQuery';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useNearbyPopularPlaces } from '../../hooks/useNearbyPopularPlaces';
import { useScrollRestoration } from '@/shared/hooks/useScrollRestoration';
import { ListPageShell } from '../ListPageShell';
import { PopularPlaceCard } from '../PopularPlaceCard';
import styles from './styles.module.scss';

const CACHE_KEY = 'place-popular-nearby';

export function PopularPlaceListPage() {
  const router = useRouter();
  const { region, source: regionSource, isLocating } = useRegion();

  // 직접 고른 지역이 있으면 그 지역을 보여주고, 위치를 못 잡았을 때만 전국 목록으로 넘긴다.
  useEffect(() => {
    if (regionSource === 'default' && !isLocating) {
      router.replace('/place/popular/nationwide');
    }
  }, [regionSource, isLocating, router]);

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
    // 지역이 정해지기 전(저장된 지역을 읽는 중·위치 확인 중)에는 기본 지역(서울)로 조회하지 않는다.
    query: isLocating ? null : buildNearbyQuery(region),
    cacheKey: CACHE_KEY,
  });

  const pageTitle =
    regionSource === 'manual' ? `${region.name} 인기 장소` : '내 주변 인기 장소';

  const sentinelRef = useInfiniteScroll({
    enabled: hasNext && !isLoadingMore && !error,
    onIntersect: loadMore,
  });

  // 목록 → 상세 → 뒤로가기 시 스크롤 위치 복원
  // 지역마다 목록이 달라 스크롤 위치도 지역별로 기억한다.
  useScrollRestoration(
    isLocating ? null : `${CACHE_KEY}:${region.id}`,
    !isLoading && items.length > 0
  );

  const showShellLoading =
    isLoading || isLocating;

  return (
    <ListPageShell
      title={pageTitle}
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
