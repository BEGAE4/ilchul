'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PaginatedResponse } from '../types';
import { readListState, saveListState } from '@/shared/lib/listStateCache';

type FetchParams<P> = P & { page: number; limit: number };

interface UsePaginatedListOptions<T, P extends Record<string, unknown>> {
  fetchFn: (params: FetchParams<P>) => Promise<PaginatedResponse<T>>;
  baseParams: P;
  limit?: number;
  enabled?: boolean;
  // 지정하면 무한 스크롤로 누적된 목록/페이지 상태를 세션에 저장하고,
  // 뒤로가기로 돌아왔을 때 복원한다(재요청 없이 이전 스크롤 위치까지 유지).
  cacheKey?: string;
}

interface UsePaginatedListResult<T> {
  items: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasNext: boolean;
  totalCount: number;
  page: number;
  loadMore: () => void;
  retry: () => void;
}

const DEFAULT_LIMIT = 20;

export function usePaginatedList<
  T extends { id: string | number },
  P extends Record<string, unknown>,
>(options: UsePaginatedListOptions<T, P>): UsePaginatedListResult<T> {
  const { fetchFn, baseParams, limit = DEFAULT_LIMIT, enabled = true, cacheKey } = options;

  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const requestIdRef = useRef(0);
  const baseParamsKey = JSON.stringify(baseParams);

  const loadPage = useCallback(
    async (targetPage: number, mode: 'initial' | 'more') => {
      const reqId = ++requestIdRef.current;
      if (mode === 'initial') setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      try {
        const res = await fetchFn({
          ...baseParams,
          page: targetPage,
          limit,
        });
        if (reqId !== requestIdRef.current) return;

        setItems((prev) => {
          if (mode === 'initial') return res.data;
          const seen = new Set(prev.map((item) => item.id));
          const next = [...prev];
          res.data.forEach((item) => {
            if (!seen.has(item.id)) next.push(item);
          });
          return next;
        });
        setPage(res.page);
        setHasNext(res.hasNext);
        setTotalCount(res.totalCount);
      } catch (err) {
        if (reqId !== requestIdRef.current) return;
        setError(err instanceof Error ? err : new Error('알 수 없는 오류'));
      } finally {
        if (reqId === requestIdRef.current) {
          if (mode === 'initial') setIsLoading(false);
          else setIsLoadingMore(false);
        }
      }
    },
    // baseParamsKey replaces baseParams for stable identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchFn, baseParamsKey, limit]
  );

  useEffect(() => {
    if (!enabled) return;
    // 뒤로가기 등으로 돌아온 경우: 세션에 저장된 누적 목록이 있으면 복원하고 재요청하지 않는다.
    // StrictMode(dev)에서 effect가 두 번 실행돼도 항상 캐시를 재확인하므로(가드 ref 미사용)
    // 두 번째 실행이 loadPage 로 새로 받아와 캐시를 덮어쓰지 않는다.
    if (cacheKey) {
      const cached = readListState<T>(cacheKey);
      if (cached && cached.items.length > 0) {
        setItems(cached.items);
        setPage(cached.page);
        setHasNext(cached.hasNext);
        setTotalCount(cached.totalCount);
        setIsLoading(false);
        return;
      }
    }
    loadPage(1, 'initial');
    // baseParamsKey changes drive reload, loadPage already depends on it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseParamsKey, enabled]);

  // 누적 상태를 세션에 저장 (무한 스크롤/복원 후에도 최신 상태 유지)
  useEffect(() => {
    if (!cacheKey || items.length === 0) return;
    saveListState(cacheKey, { items, page, hasNext, totalCount });
  }, [cacheKey, items, page, hasNext, totalCount]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasNext) return;
    loadPage(page + 1, 'more');
  }, [isLoading, isLoadingMore, hasNext, page, loadPage]);

  const retry = useCallback(() => {
    loadPage(1, 'initial');
  }, [loadPage]);

  return {
    items,
    isLoading,
    isLoadingMore,
    error,
    hasNext,
    totalCount,
    page,
    loadMore,
    retry,
  };
}
