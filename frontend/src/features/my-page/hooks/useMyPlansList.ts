'use client';

import { usePaginatedList } from '@/features/main/hooks/usePaginatedList';
import { fetchMyPlansPage, type MyPlanListItem } from '../api/my-page.api';

const LIMIT = 20;

// 마이페이지 '내 플랜' 탭 — 홈 인기 목록과 같은 page/limit 누적 조회 (usePaginatedList).
// 내 플랜은 생성·삭제·공개 전환으로 자주 바뀌므로 세션 캐시(cacheKey)는 두지 않고 들어올 때마다 새로 받는다.
export function useMyPlansList({ enabled = true }: { enabled?: boolean } = {}) {
  return usePaginatedList<MyPlanListItem, Record<string, never>>({
    fetchFn: fetchMyPlansPage,
    baseParams: {},
    limit: LIMIT,
    enabled,
  });
}
