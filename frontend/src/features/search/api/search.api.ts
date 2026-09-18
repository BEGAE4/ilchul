import apiClient from '@/shared/lib/api/apiClient';
import type {
  PopularSearchKeyword,
  RecentSearch,
  SearchAutocompleteItem,
  SearchResultResponse,
} from '../types/search.types';

const RECENT = '/api/search/recent';

/** 최근 검색기록 조회 — GET /api/search/recent */
export const fetchRecentSearches = async (): Promise<RecentSearch[]> => {
  const res = await apiClient.get<RecentSearch[]>(RECENT);
  return res.data ?? [];
};

/** 최근 검색기록 추가 — POST /api/search/recent */
export const addRecentSearch = async (name: string): Promise<void> => {
  await apiClient.post(RECENT, { name });
};

/** 최근 검색기록 단건 삭제 — DELETE /api/search/recent (body: name, createdAt) */
export const deleteRecentSearch = async (item: RecentSearch): Promise<void> => {
  await apiClient.delete(RECENT, { data: item });
};

/** 최근 검색기록 전체 삭제 — 단건 삭제 API를 항목별로 호출 */
export const deleteRecentSearches = async (items: RecentSearch[]): Promise<void> => {
  await Promise.all(items.map((item) => deleteRecentSearch(item)));
};

/** 통합 검색 — GET /api/search */
export const searchAll = async (
  keyword: string,
  params: { page?: number; limit?: number } = {}
): Promise<SearchResultResponse> => {
  const res = await apiClient.get<SearchResultResponse>('/api/search', {
    params: { keyword, ...params },
  });
  return res.data;
};

/** 검색어 자동완성 — GET /api/search/autocomplete */
export const fetchAutocomplete = async (
  keyword: string,
  limit = 5
): Promise<SearchAutocompleteItem[]> => {
  const res = await apiClient.get<SearchAutocompleteItem[]>('/api/search/autocomplete', {
    params: { keyword, limit },
  });
  return res.data ?? [];
};

/** 인기 검색어 — GET /api/search/popular */
export const fetchPopularKeywords = async (): Promise<PopularSearchKeyword[]> => {
  const res = await apiClient.get<PopularSearchKeyword[]>('/api/search/popular');
  return res.data ?? [];
};
