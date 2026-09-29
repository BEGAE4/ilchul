export interface PaginatedResponse<T> {
  status: number;
  message: string;
  data: T[];
  page: number;
  limit: number;
  hasNext: boolean;
  totalCount: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** 주변 목록 조회 조건 — 지역명으로 조회하고, 고른 시군구가 있으면 쉼표로 이어 보낸다 (buildNearbyQuery 참고). */
export type NearbyQuery = { region: string; sigungu?: string };

export type NearbyParams = PaginationParams & NearbyQuery;
