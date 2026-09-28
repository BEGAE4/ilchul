'use client';

import { usePaginatedList } from '@/features/main/hooks/usePaginatedList';
import { fetchScrappedPlansPage, type ScrappedPlanListItem } from '../api/my-page.api';

const LIMIT = 20;

// 마이페이지 '저장 플랜' 탭 — 내 플랜 탭과 같은 무한 스크롤 (useMyPlansList 참고)
export function useScrappedPlansList({ enabled = true }: { enabled?: boolean } = {}) {
  return usePaginatedList<ScrappedPlanListItem, Record<string, never>>({
    fetchFn: fetchScrappedPlansPage,
    baseParams: {},
    limit: LIMIT,
    enabled,
  });
}
