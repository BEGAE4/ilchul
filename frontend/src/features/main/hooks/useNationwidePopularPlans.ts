'use client';

import { fetchNationwidePopularPlans } from '../api/main.api';
import type { PopularPlan } from '../types';
import { usePaginatedList } from './usePaginatedList';

interface Options {
  limit?: number;
  enabled?: boolean;
}

export function useNationwidePopularPlans({ limit, enabled = true }: Options = {}) {
  return usePaginatedList<PopularPlan, Record<string, never>>({
    fetchFn: fetchNationwidePopularPlans,
    baseParams: {},
    limit,
    enabled,
  });
}
