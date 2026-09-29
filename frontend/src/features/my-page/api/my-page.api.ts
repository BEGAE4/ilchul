import axios from 'axios';
import apiClient from '@/shared/lib/api/apiClient';
import { resizeImageForUpload } from '@/shared/lib/image';
import {
  MyPlan,
  MyPlansResponse,
  ScrappedPlan,
  ScrappedPlansResponse,
} from '../types/plan.types';
import {
  MyPageProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '../types/profile.types';
import { MyPageSummary } from '../types/summary.types';
import type { PaginatedResponse, PaginationParams } from '@/features/main/types/pagination.types';
import { normalizePagedList } from '@/shared/lib/api/normalizePagedList';
import { sortMyPlansNewest, sortScrappedPlansNewest } from '../utils/sortPlans';

// 내 플랜 목록 조회 API
export const fetchMyPlans = async (): Promise<MyPlan[]> => {
  const response = await axios.get<MyPlansResponse>('/api/mypage/plans');
  return response.data.plans ?? [];
};

// usePaginatedList 가 id 로 중복을 걸러내므로 planId 를 id 로도 노출한다
export type MyPlanListItem = MyPlan & { id: number };
export type ScrappedPlanListItem = ScrappedPlan & { id: number };

// 내 플랜 목록 한 페이지 — 홈 인기 목록과 같은 page/limit 조회 (무한 스크롤)
// 백엔드가 아직 페이징을 지원하지 않으면 전체가 한 번에 오고 hasNext=false 로 정규화된다.
export const fetchMyPlansPage = async (
  params: PaginationParams
): Promise<PaginatedResponse<MyPlanListItem>> => {
  const response = await axios.get<MyPlansResponse>('/api/mypage/plans', { params });
  const body = response.data;
  // 서버 순서가 정해져 있지 않아 생성 최신순으로 맞춘다
  const plans = sortMyPlansNewest(body?.plans ?? []).map((plan) => ({ ...plan, id: plan.planId }));
  return normalizePagedList(plans, body, params);
};

// 저장(스크랩)한 플랜 목록 한 페이지 — 위와 같은 규칙
export const fetchScrappedPlansPage = async (
  params: PaginationParams
): Promise<PaginatedResponse<ScrappedPlanListItem>> => {
  const response = await axios.get<ScrappedPlansResponse>('/api/mypage/scrapped', { params });
  const body = response.data;
  const plans = sortScrappedPlansNewest(body?.scrappedPlans ?? []).map((plan) => ({ ...plan, id: plan.planId }));
  return normalizePagedList(plans, body, params);
};

// 내 플랜 공개 여부 토글 API (v5: POST /api/mypage/plan/visibility/{planId}, 본문 없음)
// 저장(스크랩)한 플랜 목록 조회 API
export const fetchScrappedPlans = async (): Promise<ScrappedPlan[]> => {
  const response = await axios.get<ScrappedPlansResponse>(
    '/api/mypage/scrapped'
  );
  return response.data.scrappedPlans ?? [];
};

// 내 플랜 공개 여부 설정 API
export const setMyPlanVisibility = async (
  planId: number
): Promise<{ status: number }> => {
  const response = await axios.post<{ status: number }>(
    `/api/mypage/plan/visibility/${planId}`
  );
  return response.data;
};

// 사용자 프로필 조회 API
export const fetchMyPageProfile = async (): Promise<MyPageProfile> => {
  const response = await axios.get<MyPageProfile>('/api/mypage/profile');
  return response.data;
};

// 사용자 프로필 수정 API
export const updateMyPageProfile = async (
  body: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  const response = await axios.patch<UpdateProfileResponse>(
    '/api/mypage/profile',
    body
  );
  return response.data;
};

// 프로필 사진 업로드 — multipart, 필드명 image. 200 + 갱신된 프로필. 2026-09-18 백엔드 추가 (2차 요청 §3)
//  - 400 허용되지 않는 형식(JPG·PNG·WEBP 만) · 413 용량 초과 · 401 미로그인
//  - 서버 한도는 파일 15MB 다 (2026-09-20 반영). 프로필은 작게만 보이므로 올리기 전에 긴 변 1024px 로 줄인다.
//  - multipart 는 Next 프록시 라우트를 두지 않고 플랜 사진처럼 백엔드로 바로 보낸다.
export const uploadProfileImage = async (file: File): Promise<UpdateProfileResponse> => {
  const form = new FormData();
  form.append('image', await resizeImageForUpload(file));
  const { data } = await apiClient.post<UpdateProfileResponse>('/api/mypage/profile/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// 프로필 사진 삭제 — 200 + 갱신된 프로필(userImg: null). 서버는 이후 소셜 사진 자동 동기화도 멈춘다 (§4)
export const deleteProfileImage = async (): Promise<UpdateProfileResponse> => {
  const { data } = await apiClient.delete<UpdateProfileResponse>('/api/mypage/profile/image');
  return data;
};

// 사용자 프로필 COUNT 조회 API
export const fetchMyPageSummary = async (): Promise<MyPageSummary> => {
  const response = await axios.get<MyPageSummary>('/api/mypage/summary');
  return response.data;
};


