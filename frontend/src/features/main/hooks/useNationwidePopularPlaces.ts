'use client';

import { fetchNationwidePopularPlaces } from '../api/main.api';
import type { PopularPlace } from '../types';
import { usePaginatedList } from './usePaginatedList';

interface Options {
  limit?: number;
  enabled?: boolean;
}

export function useNationwidePopularPlaces({ limit, enabled = true }: Options = {}) {
  return usePaginatedList<PopularPlace, Record<string, never>>({
    fetchFn: fetchNationwidePopularPlaces,
    baseParams: {},
    limit,
    enabled,
  });
}
