import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import * as placeApi from '../api/place.api';
import { toNumericPlaceId } from '../utils/placeId';

interface UsePlaceActionsOptions {
  // 목데이터 id 등 서버 연동이 불가능할 때 대신 실행할 로컬 토글
  onLocalLike?: () => void;
  onLocalScrap?: () => void;
  // 상세 응답이 제공하는 초기 상태 (BE가 필드를 주면 새로고침 후에도 유지됨)
  initialIsLiked?: boolean;
  initialLikeCount?: number;
  initialIsScrapped?: boolean;
  initialScrapCount?: number;
}

// 장소 좋아요 / 스크랩 상태를 서버와 동기화하는 훅.
// 서버 장소(숫자 id)이면 API를 호출하고, 아니면 로컬 폴백을 실행한다.
// 두 API 모두 최신 상태를 응답하므로 응답값으로 상태를 확정한다.
export function usePlaceActions(placeId: string, options: UsePlaceActionsOptions = {}) {
  const numericId = toNumericPlaceId(placeId);
  const isServerPlace = numericId !== null;

  const {
    initialIsLiked,
    initialLikeCount,
    initialIsScrapped,
    initialScrapCount,
  } = options;

  const [isLiked, setIsLiked] = useState(initialIsLiked ?? false);
  const [likeCount, setLikeCount] = useState(initialLikeCount ?? 0);
  const [isScrapped, setIsScrapped] = useState(initialIsScrapped ?? false);
  const [scrapCount, setScrapCount] = useState(initialScrapCount ?? 0);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isScrapPending, setIsScrapPending] = useState(false);

  // 상세 응답(초기 상태)이 뒤늦게 도착하면 그 값으로 동기화한다.
  useEffect(() => {
    if (initialIsLiked !== undefined) setIsLiked(initialIsLiked);
    if (initialLikeCount !== undefined) setLikeCount(initialLikeCount);
    if (initialIsScrapped !== undefined) setIsScrapped(initialIsScrapped);
    if (initialScrapCount !== undefined) setScrapCount(initialScrapCount);
  }, [initialIsLiked, initialLikeCount, initialIsScrapped, initialScrapCount]);

  const toggleLike = useCallback(async () => {
    if (numericId === null) {
      options.onLocalLike?.();
      return;
    }
    if (isLikePending) return;
    setIsLikePending(true);
    try {
      const res = isLiked
        ? await placeApi.unlikePlace(numericId)
        : await placeApi.likePlace(numericId);
      setIsLiked(res.isLiked);
      setLikeCount(res.likeCount);
    } catch {
      toast.error('좋아요 처리에 실패했어요.');
    } finally {
      setIsLikePending(false);
    }
  }, [numericId, isLiked, isLikePending, options]);

  const toggleScrap = useCallback(async () => {
    if (numericId === null) {
      options.onLocalScrap?.();
      return;
    }
    if (isScrapPending) return;
    setIsScrapPending(true);
    try {
      const res = isScrapped
        ? await placeApi.unscrapPlace(numericId)
        : await placeApi.scrapPlace(numericId);
      setIsScrapped(res.isBookmarked);
      setScrapCount(res.bookmarkCount);
      toast.success(res.isBookmarked ? '북마크에 저장했어요!' : '북마크를 해제했어요.');
    } catch {
      toast.error('스크랩 처리에 실패했어요.');
    } finally {
      setIsScrapPending(false);
    }
  }, [numericId, isScrapped, isScrapPending, options]);

  return { isServerPlace, isLiked, likeCount, isScrapped, scrapCount, toggleLike, toggleScrap };
}
