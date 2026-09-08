'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { searchAll } from '../api/search.api';
import type { SearchPlaceResult, SearchPlanResult } from '../types/search.types';

const SEARCH_LIMIT = 30;

// 뒤로가기로 돌아왔을 때 누적된 검색 결과·페이지를 복원하기 위한 세션 캐시
const CACHE_PREFIX = 'ilchul:search:';
const CACHE_TTL = 10 * 60 * 1000; // 10분

interface SearchCache {
  places: SearchPlaceResult[];
  plans: SearchPlanResult[];
  placeTotalCount: number;
  planTotalCount: number;
  hasNextPlace: boolean;
  hasNextPlan: boolean;
  page: number;
  savedAt: number;
}

function readSearchCache(keyword: string): SearchCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + keyword);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SearchCache;
    if (Date.now() - parsed.savedAt > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_PREFIX + keyword);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeSearchCache(keyword: string, cache: Omit<SearchCache, 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + keyword,
      JSON.stringify({ ...cache, savedAt: Date.now() })
    );
  } catch {
    /* 무시 */
  }
}

interface UseSearchResultsResult {
  places: SearchPlaceResult[];
  plans: SearchPlanResult[];
  placeTotalCount: number;
  planTotalCount: number;
  hasNextPlace: boolean;
  hasNextPlan: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  loadMore: () => void;
  retry: () => void;
}

// 통합 검색 결과를 페이지네이션과 함께 관리한다.
// GET /api/search 한 번 호출로 장소·플랜을 함께 받고, 더 보기 시 page를 증가시켜
// 두 목록을 누적한다(id 기준 중복 제거). 실패는 "결과 없음"과 구분해 isError로 노출한다.
export function useSearchResults(keyword: string): UseSearchResultsResult {
  const [places, setPlaces] = useState<SearchPlaceResult[]>([]);
  const [plans, setPlans] = useState<SearchPlanResult[]>([]);
  const [placeTotalCount, setPlaceTotalCount] = useState(0);
  const [planTotalCount, setPlanTotalCount] = useState(0);
  const [hasNextPlace, setHasNextPlace] = useState(false);
  const [hasNextPlan, setHasNextPlan] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  const requestIdRef = useRef(0);

  const loadPage = useCallback(
    async (targetPage: number, mode: 'initial' | 'more') => {
      if (!keyword) {
        setPlaces([]);
        setPlans([]);
        setPlaceTotalCount(0);
        setPlanTotalCount(0);
        setHasNextPlace(false);
        setHasNextPlan(false);
        setIsLoading(false);
        setIsError(false);
        return;
      }

      const reqId = ++requestIdRef.current;
      if (mode === 'initial') setIsLoading(true);
      else setIsLoadingMore(true);
      setIsError(false);

      try {
        const data = await searchAll(keyword, { page: targetPage, limit: SEARCH_LIMIT });
        if (reqId !== requestIdRef.current) return;

        setPlaces((prev) => {
          if (mode === 'initial') return data.places;
          const seen = new Set(prev.map((p) => p.placeId));
          return [...prev, ...data.places.filter((p) => !seen.has(p.placeId))];
        });
        setPlans((prev) => {
          if (mode === 'initial') return data.plans;
          const seen = new Set(prev.map((p) => p.planId));
          return [...prev, ...data.plans.filter((p) => !seen.has(p.planId))];
        });
        setPlaceTotalCount(data.placeTotalCount);
        setPlanTotalCount(data.planTotalCount);
        setHasNextPlace(data.hasNextPlace);
        setHasNextPlan(data.hasNextPlan);
        setPage(data.page ?? targetPage);
      } catch (err) {
        if (reqId !== requestIdRef.current) return;
        console.error('통합 검색 실패:', err);
        setIsError(true);
      } finally {
        if (reqId === requestIdRef.current) {
          if (mode === 'initial') setIsLoading(false);
          else setIsLoadingMore(false);
        }
      }
    },
    [keyword]
  );

  useEffect(() => {
    // 뒤로가기 등으로 돌아온 경우: 세션 캐시가 있으면 복원하고 재요청하지 않는다.
    if (keyword) {
      const cached = readSearchCache(keyword);
      if (cached) {
        setPlaces(cached.places);
        setPlans(cached.plans);
        setPlaceTotalCount(cached.placeTotalCount);
        setPlanTotalCount(cached.planTotalCount);
        setHasNextPlace(cached.hasNextPlace);
        setHasNextPlan(cached.hasNextPlan);
        setPage(cached.page);
        setIsLoading(false);
        setIsError(false);
        return;
      }
    }
    setPage(1);
    loadPage(1, 'initial');
  }, [loadPage, keyword]);

  // 누적 상태를 세션에 저장 (무한 스크롤/복원 후에도 최신 상태 유지)
  useEffect(() => {
    if (!keyword || isLoading || isError) return;
    if (places.length === 0 && plans.length === 0) return;
    writeSearchCache(keyword, {
      places,
      plans,
      placeTotalCount,
      planTotalCount,
      hasNextPlace,
      hasNextPlan,
      page,
    });
  }, [
    keyword,
    isLoading,
    isError,
    places,
    plans,
    placeTotalCount,
    planTotalCount,
    hasNextPlace,
    hasNextPlan,
    page,
  ]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || isError) return;
    if (!hasNextPlace && !hasNextPlan) return;
    loadPage(page + 1, 'more');
  }, [isLoading, isLoadingMore, isError, hasNextPlace, hasNextPlan, page, loadPage]);

  const retry = useCallback(() => {
    setPage(1);
    loadPage(1, 'initial');
  }, [loadPage]);

  return {
    places,
    plans,
    placeTotalCount,
    planTotalCount,
    hasNextPlace,
    hasNextPlan,
    isLoading,
    isLoadingMore,
    isError,
    loadMore,
    retry,
  };
}
