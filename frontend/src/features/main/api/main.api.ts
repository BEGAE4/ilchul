import axios from 'axios';
import type {
  NearbyParams,
  PaginatedResponse,
  PaginationParams,
  PopularPlace,
  PopularPlan,
} from '../types';

// MAIN-57. 내 주변 실시간 베스트 플랜 조회
export const fetchNearbyPopularPlans = async (
  params: NearbyParams
): Promise<PaginatedResponse<PopularPlan>> => {
  const response = await axios.get<PaginatedResponse<PopularPlan>>(
    '/api/plan/popular',
    { params }
  );
  return response.data;
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
  return response.data;
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
