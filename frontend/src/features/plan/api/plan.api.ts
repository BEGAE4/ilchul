import apiClient from '@/shared/lib/api/apiClient';
import type {
  CreatePlanBody,
  CreatePlanResponse,
  PlanDetail,
  UpdatePlanBody,
  UpdatePlanResponse,
  UpdatePlanPlacesBody,
  UpdatePlanPlacesResponse,
  ClonePlanBody,
  ClonePlanResponse,
  PlanPreviewResponse,
  StampPlanPlaceResponse,
  LikeResponse,
  ScrapPlanResponse,
  MyPlansResponse,
  ScrappedPlansResponse,
} from '../types/plan.types';

// 플랜 생성 — 출발지/일정/장소까지 일괄 등록
export async function createPlan(body: CreatePlanBody): Promise<CreatePlanResponse> {
  const { data } = await apiClient.post<CreatePlanResponse>('/api/plan/create', body);
  return data;
}

// 플랜 상세 조회 — PlanDetailDto 직접 반환 (래핑 없음)
export async function fetchPlanDetail(planId: number): Promise<PlanDetail> {
  const { data } = await apiClient.get<PlanDetail>(`/api/plan/${planId}`);
  return data;
}

// 플랜 수정
export async function updatePlan(
  planId: number,
  body: UpdatePlanBody
): Promise<UpdatePlanResponse> {
  const { data } = await apiClient.patch<UpdatePlanResponse>(`/api/plan/${planId}`, body);
  return data;
}

// 플랜 삭제
export async function deletePlan(planId: number): Promise<void> {
  await apiClient.delete(`/api/plan/${planId}`);
}

// 플랜 장소 일괄 업데이트 (출발지 + 장소 목록 통합 저장)
export async function updatePlanPlaces(
  planId: number,
  body: UpdatePlanPlacesBody
): Promise<UpdatePlanPlacesResponse> {
  const { data } = await apiClient.post<UpdatePlanPlacesResponse>(
    `/api/plan-place/${planId}/update`,
    body
  );
  return data;
}

// 플랜 수정 프리뷰 — 저장 전 소요시간/거리 재계산 결과 조회
export async function updatePlanPreview(
  planId: number,
  body: UpdatePlanPlacesBody
): Promise<PlanPreviewResponse> {
  const { data } = await apiClient.post<PlanPreviewResponse>(
    `/api/plan-place/${planId}/preview`,
    body
  );
  return data;
}

// 플랜 생성 프리뷰
export async function createPlanPreview(body: {
  planTitle?: string;
  planDescription?: string;
  isPlanVisible?: boolean;
  departurePoint?: CreatePlanBody['departurePoint'];
  tripStartDate?: string;
  tripEndDate?: string;
  places: { placeId: number; order: number }[];
}): Promise<PlanPreviewResponse> {
  const { data } = await apiClient.post<PlanPreviewResponse>('/api/plan-place/preview', body);
  return data;
}

// 장소 스탬프 인증 — multipart (사진 + 현재 좌표)
export async function stampPlanPlace(
  planPlaceId: number,
  image: File,
  location: { x: number; y: number } | null
): Promise<StampPlanPlaceResponse> {
  const form = new FormData();
  form.append('image', image);
  if (location) {
    form.append('location', new Blob([JSON.stringify(location)], { type: 'application/json' }));
  }
  const { data } = await apiClient.post<StampPlanPlaceResponse>(
    `/api/plan-place/${planPlaceId}/stamp`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
}

// 플랜 이미지 업로드 (multipart)
export async function uploadPlanImages(planId: number, images: File[]): Promise<PlanDetail> {
  const form = new FormData();
  images.forEach((img) => form.append('images', img));
  const { data } = await apiClient.post<PlanDetail>(`/api/plan/${planId}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// 플랜 이미지 삭제
export async function deletePlanImages(planId: number, imageIds: number[]): Promise<PlanDetail> {
  const { data } = await apiClient.delete<PlanDetail>(`/api/plan/${planId}/images`, {
    params: { imageIds: imageIds.join(',') },
  });
  return data;
}

// 플랜 복제 (일정 담기)
export async function clonePlan(
  planId: number,
  body: ClonePlanBody = {}
): Promise<ClonePlanResponse> {
  const { data } = await apiClient.post<ClonePlanResponse>(`/api/plan/${planId}/clone`, body);
  return data;
}

// 플랜 공개 여부 토글 — 본문 없는 토글형
export async function togglePlanVisibility(planId: number): Promise<void> {
  await apiClient.post(`/api/mypage/plan/visibility/${planId}`);
}

// 플랜 좋아요 / 취소
export async function likePlan(planId: number): Promise<LikeResponse> {
  const { data } = await apiClient.post<LikeResponse>(`/api/like/${planId}`);
  return data;
}

export async function unlikePlan(planId: number): Promise<LikeResponse> {
  const { data } = await apiClient.delete<LikeResponse>(`/api/like/${planId}`);
  return data;
}

// 플랜 스크랩 — POST 단일 토글, 응답의 isBookmarked로 상태 판별
export async function togglePlanScrap(planId: number): Promise<ScrapPlanResponse> {
  const { data } = await apiClient.post<ScrapPlanResponse>(`/api/plan/scrapped/${planId}`);
  return data;
}

// 내 플랜 목록 조회
export async function fetchMyPlans(): Promise<MyPlansResponse> {
  const { data } = await apiClient.get<MyPlansResponse>('/api/mypage/plans');
  return data;
}

// 내 스크랩 목록 조회
export async function fetchMyScraps(): Promise<ScrappedPlansResponse> {
  const { data } = await apiClient.get<ScrappedPlansResponse>('/api/mypage/scrapped');
  return data;
}
