'use client';

import { fetchNationwidePopularPlaces } from '../api/main.api';
import type { PopularPlace } from '../types';
import { usePaginatedList } from './usePaginatedList';

interface Options {
  limit?: number;
  cacheKey?: string;
}

export function useNationwidePopularPlaces({ limit, cacheKey }: Options = {}) {
  return usePaginatedList<PopularPlace, Record<string, never>>({
    fetchFn: fetchNationwidePopularPlaces,
    baseParams: {},
    limit,
    cacheKey,
  });
}
