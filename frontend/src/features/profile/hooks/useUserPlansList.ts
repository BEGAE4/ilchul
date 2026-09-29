'use client';

import { usePaginatedList } from '@/features/main/hooks/usePaginatedList';
import { fetchUserPlansPage, type PublicUserPlanListItem } from '../api/user-profile.api';

const LIMIT = 20;

// 타 사용자 공개 플랜 목록 — 마이페이지와 같은 page/limit 무한 스크롤.
// userId 가 바뀌면 usePaginatedList 가 baseParams 변경으로 첫 페이지부터 다시 받는다.
export function useUserPlansList(userId: number | null, { enabled = true }: { enabled?: boolean } = {}) {
  return usePaginatedList<PublicUserPlanListItem, { userId: number }>({
    fetchFn: fetchUserPlansPage,
    baseParams: { userId: userId ?? -1 },
    limit: LIMIT,
    enabled: enabled && userId !== null,
  });
}
