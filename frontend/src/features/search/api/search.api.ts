import axios from 'axios';
import type { RecentSearch } from '../types/search.types';

const BASE = '/api/recent';

/** 최근 검색기록 조회 */
export const fetchRecentSearches = async (): Promise<RecentSearch[]> => {
  const res = await axios.get<RecentSearch[]>(BASE);
  return res.data ?? [];
};

/** 최근 검색기록 추가 */
export const addRecentSearch = async (name: string): Promise<void> => {
  await axios.post(BASE, {
    name,
    createdAt: new Date().toISOString(),
  });
};

/** 최근 검색기록 전체 삭제 */
export const deleteRecentSearches = async (): Promise<void> => {
  await axios.delete(BASE);
};
