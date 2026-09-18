// 최근 검색어 (GET /api/search/recent → SearchLog[])
export interface RecentSearch {
  name: string;
  createdAt: string;
}

// 인기 검색어 (GET /api/search/popular → PopularSearchKeywordDto[])
export interface PopularSearchKeyword {
  ranking: number;
  keyword: string;
  score: number;
}

// 검색어 자동완성 (GET /api/search/autocomplete → SearchAutocompleteItemDto[])
export interface SearchAutocompleteItem {
  keyword: string;
  type: string;
  score: number;
  placeId?: number | null;
}

// 통합 검색 — 장소 (SearchPlaceResultDto)
export interface SearchPlaceResult {
  placeId: number;
  placeName: string;
  addressName: string;
  roadAddressName: string;
  categoryName: string;
  placeImageUrl: string;
  x: number;
  y: number;
  likeCount: number;
  scrapCount: number;
  includedPlanCount: number;
}

// 통합 검색 — 플랜 내 장소 (SearchPlanPlaceResultDto)
export interface SearchPlanPlaceResult {
  planPlaceId: number;
  placeId: number;
  placeName: string;
  categoryName: string;
  addressName: string;
  roadAddressName: string;
  placeImageUrl: string;
  orderIndex: number;
  matched: boolean;
}

// 통합 검색 — 플랜 (SearchPlanResultDto)
export interface SearchPlanResult {
  planId: number;
  planTitle: string;
  planDescription: string;
  requiredTime: number;
  totalDistance: number;
  likeCount: number;
  scrapCount: number;
  createAt: string;
  thumbnailUrl: string;
  matchedByPlace: boolean;
  places: SearchPlanPlaceResult[];
}

// 통합 검색 응답 (GET /api/search → SearchResultResponseDto)
export interface SearchResultResponse {
  keyword: string;
  places: SearchPlaceResult[];
  plans: SearchPlanResult[];
  page: number;
  limit: number;
  placeTotalCount: number;
  planTotalCount: number;
  hasNextPlace: boolean;
  hasNextPlan: boolean;
}
