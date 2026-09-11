import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import * as planApi from '../api/plan.api';
import type { PlanDetail } from '../types/plan.types';

// 좋아요 / 스크랩 상태를 서버와 동기화하는 훅.
// v5: 좋아요는 POST/DELETE /api/like/{planId}, 스크랩은 POST /api/plan/scrapped/{planId} 토글.
// 두 API 모두 최신 상태를 응답으로 주므로 응답값으로 상태를 확정한다.
export function usePlanActions(serverPlan: PlanDetail | null) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isScrapPending, setIsScrapPending] = useState(false);

  useEffect(() => {
    if (!serverPlan) return;
    setIsLiked(serverPlan.isLiked);
    setLikeCount(serverPlan.likeCount);
    setIsBookmarked(serverPlan.isBookmarked);
    setBookmarkCount(serverPlan.bookmarkCount);
  }, [serverPlan]);

  const toggleLike = useCallback(async () => {
    if (!serverPlan || isLikePending) return;
    setIsLikePending(true);
    const nextLiked = !isLiked;
    // 낙관적 업데이트 후 서버 응답값으로 확정, 실패 시 롤백
    setIsLiked(nextLiked);
    setLikeCount((c) => c + (nextLiked ? 1 : -1));
    try {
      const res = nextLiked
        ? await planApi.likePlan(serverPlan.planId)
        : await planApi.unlikePlan(serverPlan.planId);
      setIsLiked(res.isLiked);
      setLikeCount(res.likeCount);
      toast(res.isLiked ? '좋아요를 눌렀어요!' : '좋아요를 취소했어요.');
    } catch {
      setIsLiked(!nextLiked);
      setLikeCount((c) => c - (nextLiked ? 1 : -1));
      toast.error('좋아요 처리에 실패했어요.');
    } finally {
      setIsLikePending(false);
    }
  }, [serverPlan, isLiked, isLikePending]);

  const toggleScrap = useCallback(async () => {
    if (!serverPlan || isScrapPending) return;
    setIsScrapPending(true);
    try {
      const res = await planApi.togglePlanScrap(serverPlan.planId);
      setIsBookmarked(res.isBookmarked);
      setBookmarkCount(res.bookmarkCount);
      toast.success(res.isBookmarked ? '플랜을 저장했어요!' : '저장을 해제했어요.');
    } catch {
      toast.error('스크랩 처리에 실패했어요.');
    } finally {
      setIsScrapPending(false);
    }
  }, [serverPlan, isScrapPending]);

  return {
    isLiked,
    likeCount,
    isScrapped: isBookmarked,
    scrapCount: bookmarkCount,
    toggleLike,
    toggleScrap,
  };
}
