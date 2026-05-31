'use client';

import { fetchNearbyPopularPlans } from '../api/main.api';
import type { PopularPlan } from '../types';
import { usePaginatedList } from './usePaginatedList';

interface Options {
  lat: number | null;
  lng: number | null;
  limit?: number;
}

export function useNearbyPopularPlans({ lat, lng, limit }: Options) {
  return usePaginatedList<PopularPlan, { lat: number; lng: number }>({
    fetchFn: fetchNearbyPopularPlans,
    baseParams: { lat: lat ?? 0, lng: lng ?? 0 },
    limit,
    enabled: lat !== null && lng !== null,
  });
}
