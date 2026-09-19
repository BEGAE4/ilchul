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

/** 주변 목록 조회 조건 — 지역명으로 조회한다 (buildNearbyQuery 참고). */
export type NearbyQuery = { region: string };

export type NearbyParams = PaginationParams & NearbyQuery;
