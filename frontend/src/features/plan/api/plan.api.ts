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
} from '../types/plan.types';
import { normalizePlanDetail } from '../utils/normalizePlanDetail';
import { toServerDateTime } from '@/shared/lib/format/serverDateTime';
import { prepareImageForUpload } from '@/shared/lib/image';

// 플랜 생성 — 출발지/일정/장소까지 일괄 등록
export async function createPlan(body: CreatePlanBody): Promise<CreatePlanResponse> {
  const { data } = await apiClient.post<CreatePlanResponse>('/api/plan/create', body);
  return data;
}

// 플랜 상세 조회 — PlanDetailDto 직접 반환 (래핑 없음)
export async function fetchPlanDetail(planId: number): Promise<PlanDetail> {
  const { data } = await apiClient.get<PlanDetail>(`/api/plan/${planId}`);
  return normalizePlanDetail(data);
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
  // 'yyyy-MM-dd HH:mm' (toServerDateTime 으로 생성; ISO 'T' 형식은 400)
  tripStartDate?: string;
  tripEndDate?: string;
  places: { placeId: number; order: number }[];
}): Promise<PlanPreviewResponse> {
  const { data } = await apiClient.post<PlanPreviewResponse>('/api/plan-place/preview', body);
  return data;
}

// 장소 스탬프 인증 — multipart (사진 + 현재 좌표)
// 좌표는 `location.x` / `location.y` 폼 필드로 보낸다 (서버가 @ModelAttribute 로 바인딩).
// 이전에는 location 을 application/json Blob 파트로 보내 운영에서 항상 400 "잘못된 입력값입니다." 였다
// (2026-09-08 운영 확인: JSON 파트·{lat,lng}·request 파트 전부 400/500, 폼 필드만 200/422).
// 좌표가 없으면 서버가 500 을 내므로 호출부(MyCourseDetailPage)가 위치 없이 보내지 않게 막는다.
export async function stampPlanPlace(
  planPlaceId: number,
  image: File,
  location: { x: number; y: number } | null
): Promise<StampPlanPlaceResponse> {
  const form = new FormData();
  // 인증 판정은 폼 필드 좌표로 하므로, 사진 속 촬영 위치(EXIF)는 지워서 보낸다.
  // 앞단 업로드 제한(1MB) 때문에 휴대폰 원본은 413 으로 거절되므로 함께 줄인다 — prepareImageForUpload 참고
  form.append('image', await prepareImageForUpload(image));
  if (location) {
    form.append('location.x', String(location.x));
    form.append('location.y', String(location.y));
  }
  const { data } = await apiClient.post<StampPlanPlaceResponse>(
    `/api/plan-place/${planPlaceId}/stamp`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
}

// 플랜 이미지 업로드 (multipart)
// 앞단 업로드 제한(1MB)은 파일이 아니라 **요청 전체**에 걸린다 (0.6MB 두 장도 413, 2026-09-18 운영 확인).
// 그래서 한 장씩 줄여서 따로 보낸다. 중간에 실패하면 그때까지 올라간 장수를 실어 던진다 —
// 호출부가 "3장 중 2장만 올렸어요"처럼 알리고 화면을 새로 불러올 수 있다.
export class PlanImageUploadError extends Error {
  constructor(
    readonly uploaded: number,
    readonly total: number,
    readonly cause: unknown
  ) {
    super('plan_image_upload_failed');
    this.name = 'PlanImageUploadError';
  }
}

export async function uploadPlanImages(planId: number, images: File[]): Promise<PlanDetail> {
  let last: PlanDetail | null = null;
  for (let i = 0; i < images.length; i++) {
    try {
      const form = new FormData();
      form.append('images', await prepareImageForUpload(images[i]));
      const { data } = await apiClient.post<PlanDetail>(`/api/plan/${planId}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      last = data;
    } catch (err) {
      throw new PlanImageUploadError(i, images.length, err);
    }
  }
  if (!last) throw new PlanImageUploadError(0, 0, new Error('no_images'));
  return normalizePlanDetail(last);
}

// 플랜 이미지 삭제 — 명세 query int[]. 반복 파라미터(imageIds=1&imageIds=2)로 직렬화.
// ID 는 상세 응답의 planImages 에서 온다 (2026-09-14 백엔드 추가, 2-4). 응답은 삭제 후 상세.
export async function deletePlanImages(planId: number, imageIds: number[]): Promise<PlanDetail> {
  const { data } = await apiClient.delete<PlanDetail>(`/api/plan/${planId}/images`, {
    params: { imageIds },
    paramsSerializer: { indexes: null },
  });
  return normalizePlanDetail(data);
}

// 플랜 복제 (일정 담기)
export async function clonePlan(
  planId: number,
  body: ClonePlanBody = {}
): Promise<ClonePlanResponse> {
  const { data } = await apiClient.post<ClonePlanResponse>(`/api/plan/${planId}/clone`, body);
  return data;
}

export interface PlanSchedule {
  /** 'yyyy-MM-dd' */
  date: string;
  /** 'HH:mm' */
  startTime: string;
  /** 'HH:mm' */
  endTime: string;
}

// 플랜 복제 + 여행 일시 설정.
// 운영 복제 API 는 scheduledDate 를 받아도 반영하지 않고 tripStartDate/tripEndDate 를 null 로 둔다
// (2026-09-11 확인, 백엔드 요청 중). 그래서 복제 직후 수정 API 로 일시를 채운다.
// 복제는 성공하고 일시 저장만 실패할 수 있으므로 결과를 나눠 돌려준다 — 호출부가 사용자에게 알린다.
// 이전에는 수정 실패를 조용히 삼켜 '담았어요' 토스트 뒤에 일정이 빈 플랜이 남았다.
export async function clonePlanWithSchedule(
  planId: number,
  schedule: PlanSchedule
): Promise<{ planId: number; scheduleSaved: boolean }> {
  const res = await clonePlan(planId, { scheduledDate: schedule.date });
  try {
    await updatePlan(res.planId, {
      tripStartDate: toServerDateTime(schedule.date, schedule.startTime),
      tripEndDate: toServerDateTime(schedule.date, schedule.endTime),
    });
    return { planId: res.planId, scheduleSaved: true };
  } catch (err) {
    console.error('복제한 플랜의 일정 저장 실패:', err);
    return { planId: res.planId, scheduleSaved: false };
  }
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

// 내 플랜 / 스크랩 목록·공개 여부 토글은 my-page feature(fetchMyPlans/fetchScrappedPlans/setMyPlanVisibility)에서 담당한다.
