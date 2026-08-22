import type { RecentSearch } from '@/features/search/types/search.types';

/**
 * BFF mock 데이터 (NEXT_PUBLIC_API_BASE_URL 미설정/요청 실패 시 사용).
 * 서버 프로세스가 유지되는 동안만 메모리에 보관된다.
 */
let mockRecentSearches: RecentSearch[] = [
  { name: '강남 바베큐', createdAt: '2026-04-30T21:08:48.999594100' },
  { name: '대전 칼국수', createdAt: '2026-04-30T21:08:16.564169300' },
  { name: '강릉 카페', createdAt: '2026-04-30T21:07:48.993595700' },
];

export function getMockRecentSearches(): RecentSearch[] {
  return mockRecentSearches;
}

export function addMockRecentSearch(item: RecentSearch): void {
  mockRecentSearches = [
    item,
    ...mockRecentSearches.filter((s) => s.name !== item.name),
  ];
}

export function clearMockRecentSearches(): void {
  mockRecentSearches = [];
}
