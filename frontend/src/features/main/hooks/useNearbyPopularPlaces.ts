'use client';

import { fetchNearbyPopularPlaces } from '../api/main.api';
import type { NearbyQuery, PopularPlace } from '../types';
import { usePaginatedList } from './usePaginatedList';

interface Options {
  /** null 이면 조회하지 않는다 */
  query: NearbyQuery | null;
  limit?: number;
  enabled?: boolean;
  cacheKey?: string;
}

export function useNearbyPopularPlaces({ query, limit, enabled = true, cacheKey }: Options) {
  return usePaginatedList<PopularPlace, NearbyQuery>({
    fetchFn: fetchNearbyPopularPlaces,
    baseParams: query ?? { region: '' },
    limit,
    enabled: enabled && query !== null,
    cacheKey,
  });
}
