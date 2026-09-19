'use client';

import { fetchNearbyPopularPlans } from '../api/main.api';
import type { NearbyQuery, PopularPlan } from '../types';
import { usePaginatedList } from './usePaginatedList';

interface Options {
  /** null 이면 조회하지 않는다 */
  query: NearbyQuery | null;
  limit?: number;
  enabled?: boolean;
  cacheKey?: string;
}

export function useNearbyPopularPlans({ query, limit, enabled = true, cacheKey }: Options) {
  return usePaginatedList<PopularPlan, NearbyQuery>({
    fetchFn: fetchNearbyPopularPlans,
    baseParams: query ?? { lat: 0, lng: 0 },
    limit,
    enabled: enabled && query !== null,
    cacheKey,
  });
}
