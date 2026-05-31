'use client';

import { fetchNationwidePopularPlans } from '../api/main.api';
import type { PopularPlan } from '../types';
import { usePaginatedList } from './usePaginatedList';

interface Options {
  limit?: number;
}

export function useNationwidePopularPlans({ limit }: Options = {}) {
  return usePaginatedList<PopularPlan, Record<string, never>>({
    fetchFn: fetchNationwidePopularPlans,
    baseParams: {},
    limit,
  });
}
