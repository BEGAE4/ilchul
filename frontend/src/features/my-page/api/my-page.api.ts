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

// 내 플랜 목록 조회 API
export const fetchMyPlans = async (): Promise<MyPlan[]> => {
  const response = await axios.get<MyPlansResponse>('/api/mypage/plans');
  return response.data.plans ?? [];
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
//  - 운영 앞단(nginx)의 업로드 제한이 1MB 라 휴대폰 원본은 닿기도 전에 413 이 난다. 올리기 전에 줄인다.
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


