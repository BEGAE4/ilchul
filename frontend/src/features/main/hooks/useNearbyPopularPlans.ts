'use client';

import { fetchNearbyPopularPlans } from '../api/main.api';
import type { PopularPlan } from '../types';
import { usePaginatedList } from './usePaginatedList';

interface Options {
  lat: number | null;
  lng: number | null;
  limit?: number;
  enabled?: boolean;
  cacheKey?: string;
}

export function useNearbyPopularPlans({ lat, lng, limit, enabled = true, cacheKey }: Options) {
  return usePaginatedList<PopularPlan, { lat: number; lng: number }>({
    fetchFn: fetchNearbyPopularPlans,
    baseParams: { lat: lat ?? 0, lng: lng ?? 0 },
    limit,
    enabled: enabled && lat !== null && lng !== null,
    cacheKey,
  });
}
