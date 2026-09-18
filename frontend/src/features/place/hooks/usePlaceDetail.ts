import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import * as placeApi from '../api/place.api';
import type { PlaceDetail, PlaceReview, PlaceContainingPlan } from '../types/place.types';
import { toNumericPlaceId } from '../utils/placeId';

// axios 에러의 HTTP 상태를 사용자에게 보여줄 한국어 문구로 변환한다.
// 영문 axios 메시지("Request failed with status code 400")가 그대로 노출되지 않도록 한다.
function toPlaceErrorMessage(err: unknown): { message: string; requiresAuth: boolean } {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      return { message: '로그인이 필요한 장소예요.', requiresAuth: true };
    }
    if (status === 404 || status === 400) {
      return { message: '존재하지 않거나 삭제된 장소예요.', requiresAuth: false };
    }
    if (status && status >= 500) {
      return { message: '일시적인 오류로 장소를 불러오지 못했어요.', requiresAuth: false };
    }
  }
  return { message: '장소 정보를 불러오지 못했어요.', requiresAuth: false };
}

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
  const [reviewsError, setReviewsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);

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
        setRequiresAuth(false);
        // 후기/포함 코스는 부가 정보이므로 실패해도 상세 표시는 유지한다.
        // 단, 후기는 "실패"와 "0건"을 구분하기 위해 실패 시 플래그를 세운다.
        let reviewFailed = false;
        const [detail, reviewRes, plans] = await Promise.all([
          placeApi.fetchPlaceDetail(numericId),
          placeApi.fetchPlaceReviews(numericId).catch(() => {
            reviewFailed = true;
            return null;
          }),
          placeApi.fetchPlansContainingPlace(numericId).catch(() => []),
        ]);
        if (cancelled) return;
        setPlace(detail);
        setReviews(reviewRes?.data ?? []);
        setHasMoreReviews(reviewRes?.hasNext ?? false);
        setReviewsError(reviewFailed);
        setRelatedPlans(plans);
      } catch (err) {
        if (!cancelled) {
          setPlace(null);
          const { message, requiresAuth: needsAuth } = toPlaceErrorMessage(err);
          setError(message);
          setRequiresAuth(needsAuth);
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
    reviewsError,
    hasMoreReviews,
    isFetchingMoreReviews,
    fetchMoreReviews,
    submitReview,
    isSubmittingReview,
    relatedPlans,
    isLoading,
    error,
    requiresAuth,
  };
}
