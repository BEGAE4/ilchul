'use client';

import { fetchNationwidePopularPlaces } from '../api/main.api';
import type { PopularPlace } from '../types';
import { usePaginatedList } from './usePaginatedList';

interface Options {
  limit?: number;
}

export function useNationwidePopularPlaces({ limit }: Options = {}) {
  return usePaginatedList<PopularPlace, Record<string, never>>({
    fetchFn: fetchNationwidePopularPlaces,
    baseParams: {},
    limit,
  });
}
