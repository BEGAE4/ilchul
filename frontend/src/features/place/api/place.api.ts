import apiClient from '@/shared/lib/api/apiClient';
import type {
  PlaceDetail,
  SearchPlaceItem,
  SurveyResult,
  RecommendResponse,
  PlaceLikeResponse,
  PlaceScrapResponse,
  PlaceReviewListResponse,
  PlaceReview,
  WritePlaceReviewBody,
  PlaceContainingPlan,
} from '../types/place.types';

// 장소 상세 조회
export async function fetchPlaceDetail(placeId: number): Promise<PlaceDetail> {
  const { data } = await apiClient.get<PlaceDetail>(`/api/place/${placeId}`);
  return data;
}

// 장소 검색
export async function searchPlaces(keyword: string): Promise<SearchPlaceItem[]> {
  const { data } = await apiClient.get<SearchPlaceItem[]>('/api/place/search', {
    params: { keyword },
  });
  return data;
}

// 인기 장소(내 주변/전국)는 main feature(main.api.ts + BFF popular 라우트)에서 담당한다.

// 장소 추천 (설문 기반) — AI가 순서·체류시간까지 정한 플랜 객체(items)를 반환한다.
export async function recommendPlaces(body: SurveyResult): Promise<RecommendResponse> {
  const { data } = await apiClient.post<RecommendResponse>('/api/place/recommend', body);
  return data;
}

// 장소 좋아요 / 취소
export async function likePlace(placeId: number): Promise<PlaceLikeResponse> {
  const { data } = await apiClient.post<PlaceLikeResponse>(`/api/place/${placeId}/likes`);
  return data;
}

export async function unlikePlace(placeId: number): Promise<PlaceLikeResponse> {
  const { data } = await apiClient.delete<PlaceLikeResponse>(`/api/place/${placeId}/likes`);
  return data;
}

// 장소 스크랩 / 취소
export async function scrapPlace(placeId: number): Promise<PlaceScrapResponse> {
  const { data } = await apiClient.post<PlaceScrapResponse>(`/api/place/${placeId}/scraps`);
  return data;
}

export async function unscrapPlace(placeId: number): Promise<PlaceScrapResponse> {
  const { data } = await apiClient.delete<PlaceScrapResponse>(`/api/place/${placeId}/scraps`);
  return data;
}

// 장소 후기 목록 조회 (커서 페이징)
export async function fetchPlaceReviews(
  placeId: number,
  lastReviewId?: number,
  limit = 10
): Promise<PlaceReviewListResponse> {
  const params: Record<string, number> = { limit };
  if (lastReviewId !== undefined) params.lastReviewId = lastReviewId;
  const { data } = await apiClient.get<PlaceReviewListResponse>(`/api/place/${placeId}/review`, {
    params,
  });
  return data;
}

// 장소 후기 작성
export async function writePlaceReview(
  placeId: number,
  body: WritePlaceReviewBody
): Promise<PlaceReview> {
  const { data } = await apiClient.post<PlaceReview>(`/api/place/${placeId}/review`, body);
  return data;
}

// 장소가 포함된 공개 코스 목록
export async function fetchPlansContainingPlace(placeId: number): Promise<PlaceContainingPlan[]> {
  const { data } = await apiClient.get<PlaceContainingPlan[]>(`/api/place/${placeId}/plan`);
  return data;
}
