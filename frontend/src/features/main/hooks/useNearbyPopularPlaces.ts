'use client';

import { fetchNearbyPopularPlaces } from '../api/main.api';
import type { PopularPlace } from '../types';
import { usePaginatedList } from './usePaginatedList';

interface Options {
  lat: number | null;
  lng: number | null;
  limit?: number;
  enabled?: boolean;
  cacheKey?: string;
}

export function useNearbyPopularPlaces({ lat, lng, limit, enabled = true, cacheKey }: Options) {
  return usePaginatedList<PopularPlace, { lat: number; lng: number }>({
    fetchFn: fetchNearbyPopularPlaces,
    baseParams: { lat: lat ?? 0, lng: lng ?? 0 },
    limit,
    enabled: enabled && lat !== null && lng !== null,
    cacheKey,
  });
}
