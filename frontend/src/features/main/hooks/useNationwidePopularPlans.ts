'use client';

import { fetchNationwidePopularPlans } from '../api/main.api';
import type { PopularPlan } from '../types';
import { usePaginatedList } from './usePaginatedList';

interface Options {
  limit?: number;
  cacheKey?: string;
}

export function useNationwidePopularPlans({ limit, cacheKey }: Options = {}) {
  return usePaginatedList<PopularPlan, Record<string, never>>({
    fetchFn: fetchNationwidePopularPlans,
    baseParams: {},
    limit,
    cacheKey,
  });
}
