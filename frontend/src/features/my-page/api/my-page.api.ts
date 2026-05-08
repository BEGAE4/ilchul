import axios from 'axios';
import { MyPlan, MyPlansResponse } from '../types/plan.types';
import {
  MyPageProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '../types/profile.types';
import { MyPageSummary } from '../types/summary.types';

// 내 플랜 목록 조회 API
export const fetchMyPlans = async (): Promise<MyPlan[]> => {
  const response = await axios.get<MyPlansResponse>('/api/mypage/plans');
  return response.data.plans;
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

// 사용자 프로필 COUNT 조회 API
export const fetchMyPageSummary = async (): Promise<MyPageSummary> => {
  const response = await axios.get<MyPageSummary>('/api/mypage/summary');
  return response.data;
};


