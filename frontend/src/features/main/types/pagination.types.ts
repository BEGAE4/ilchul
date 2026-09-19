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

/**
 * 주변 목록 조회 조건. 지금은 좌표(반경 10km)만 서버가 받는다.
 * region 은 지역명 기반 조회용 — 백엔드가 `region` 파라미터를 지원하면 쓴다 (buildNearbyQuery 참고).
 */
export type NearbyQuery = { lat: number; lng: number } | { region: string };

export type NearbyParams = PaginationParams & NearbyQuery;
