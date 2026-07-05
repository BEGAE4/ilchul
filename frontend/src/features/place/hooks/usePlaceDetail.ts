import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as placeApi from '../api/place.api';
import type { PlaceDetail, PlaceReview, PlaceContainingPlan } from '../types/place.types';
import { toNumericPlaceId } from '../utils/placeId';

// 숫자 placeId면 서버에서 상세/후기/포함 코스를 함께 조회하고,
// 목데이터 id면 null을 반환해 화면이 기존 목데이터로 폴백할 수 있게 한다.
export function usePlaceDetail(placeId: string) {
  const numericId = toNumericPlaceId(placeId);

  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [isFetchingMoreReviews, setIsFetchingMoreReviews] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [relatedPlans, setRelatedPlans] = useState<PlaceContainingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (numericId === null) {
      setPlace(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        // 후기/포함 코스는 부가 정보이므로 실패해도 상세 표시는 유지한다
        const [detail, reviewRes, plans] = await Promise.all([
          placeApi.fetchPlaceDetail(numericId),
          placeApi.fetchPlaceReviews(numericId).catch(() => null),
          placeApi.fetchPlansContainingPlace(numericId).catch(() => []),
        ]);
        if (cancelled) return;
        setPlace(detail);
        setReviews(reviewRes?.data ?? []);
        setHasMoreReviews(reviewRes?.hasNext ?? false);
        setRelatedPlans(plans);
      } catch (err) {
        if (!cancelled) {
          setPlace(null);
          setError(err instanceof Error ? err.message : '장소 정보를 불러오지 못했어요.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [numericId]);

  // 후기 더보기 — 커서 페이징 (lastReviewId)
  const fetchMoreReviews = useCallback(async () => {
    if (numericId === null || !hasMoreReviews || isFetchingMoreReviews || reviews.length === 0)
      return;
    setIsFetchingMoreReviews(true);
    try {
      const lastReviewId = reviews[reviews.length - 1].reviewId;
      const res = await placeApi.fetchPlaceReviews(numericId, lastReviewId);
      setReviews((prev) => [...prev, ...res.data]);
      setHasMoreReviews(res.hasNext);
    } catch {
      toast.error('후기를 더 불러오지 못했어요.');
    } finally {
      setIsFetchingMoreReviews(false);
    }
  }, [numericId, hasMoreReviews, isFetchingMoreReviews, reviews]);

  // 후기 작성 — 성공 시 목록 맨 앞에 추가
  const submitReview = useCallback(
    async (content: string): Promise<boolean> => {
      const trimmed = content.trim();
      if (numericId === null || !trimmed || isSubmittingReview) return false;
      setIsSubmittingReview(true);
      try {
        const created = await placeApi.writePlaceReview(numericId, { content: trimmed });
        setReviews((prev) => [created, ...prev]);
        toast.success('후기가 등록되었어요!');
        return true;
      } catch {
        toast.error('후기 등록에 실패했어요. 잠시 후 다시 시도해주세요.');
        return false;
      } finally {
        setIsSubmittingReview(false);
      }
    },
    [numericId, isSubmittingReview]
  );

  return {
    place,
    reviews,
    hasMoreReviews,
    isFetchingMoreReviews,
    fetchMoreReviews,
    submitReview,
    isSubmittingReview,
    relatedPlans,
    isLoading,
    error,
  };
}
