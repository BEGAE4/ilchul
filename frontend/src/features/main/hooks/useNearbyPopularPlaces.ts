'use client';

import { fetchNearbyPopularPlaces } from '../api/main.api';
import type { PopularPlace } from '../types';
import { usePaginatedList } from './usePaginatedList';

interface Options {
  lat: number | null;
  lng: number | null;
  limit?: number;
}

export function useNearbyPopularPlaces({ lat, lng, limit }: Options) {
  return usePaginatedList<PopularPlace, { lat: number; lng: number }>({
    fetchFn: fetchNearbyPopularPlaces,
    baseParams: { lat: lat ?? 0, lng: lng ?? 0 },
    limit,
    enabled: lat !== null && lng !== null,
  });
}
