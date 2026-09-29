import axios from 'axios';
import type {
  NearbyParams,
  PaginatedResponse,
  PaginationParams,
  PopularPlace,
  PopularPlan,
  RegionMeta,
  RegionMetaResponse,
} from '../types';
import { fixRoParticle } from '@/shared/lib/format/josa';

// 예전에 생성된 플랜 설명 "도보으로 떠나는…" 이 DB 에 남아 있다 (B-23). 정정 전까지 표시용으로 고친다.
function fixPlanDescriptions(
  response: PaginatedResponse<PopularPlan>
): PaginatedResponse<PopularPlan> {
  if (!Array.isArray(response?.data)) return response;
  return {
    ...response,
    data: response.data.map((plan) => ({ ...plan, description: fixRoParticle(plan.description) })),
  };
}

// MAIN-57. 내 주변 실시간 베스트 플랜 조회
export const fetchNearbyPopularPlans = async (
  params: NearbyParams
): Promise<PaginatedResponse<PopularPlan>> => {
  const response = await axios.get<PaginatedResponse<PopularPlan>>(
    '/api/plan/popular',
    { params }
  );
  return fixPlanDescriptions(response.data);
};

// MAIN-61. 내 주변 인기 장소 조회
export const fetchNearbyPopularPlaces = async (
  params: NearbyParams
): Promise<PaginatedResponse<PopularPlace>> => {
  const response = await axios.get<PaginatedResponse<PopularPlace>>(
    '/api/place/popular',
    { params }
  );
  return response.data;
};

// MAIN-58. 전국 인기 플랜 조회
export const fetchNationwidePopularPlans = async (
  params: PaginationParams
): Promise<PaginatedResponse<PopularPlan>> => {
  const response = await axios.get<PaginatedResponse<PopularPlan>>(
    '/api/plan/popular/nationwide',
    { params }
  );
  return fixPlanDescriptions(response.data);
};

// MAIN-60. 전국 인기 장소 조회
export const fetchNationwidePopularPlaces = async (
  params: PaginationParams
): Promise<PaginatedResponse<PopularPlace>> => {
  const response = await axios.get<PaginatedResponse<PopularPlace>>(
    '/api/place/popular/nationwide',
    { params }
  );
  return response.data;
};

// 지역 메타 — 시/도 목록·별칭·장소 수·시군구 (GET /api/region, 2026-09-29)
export const fetchRegions = async (): Promise<RegionMeta[]> => {
  const response = await axios.get<RegionMetaResponse>('/api/region');
  return Array.isArray(response.data?.regions) ? response.data.regions : [];
};
