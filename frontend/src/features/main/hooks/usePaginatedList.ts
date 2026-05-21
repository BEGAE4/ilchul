'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PaginatedResponse } from '../types';

type FetchParams<P> = P & { page: number; limit: number };

interface UsePaginatedListOptions<T, P extends Record<string, unknown>> {
  fetchFn: (params: FetchParams<P>) => Promise<PaginatedResponse<T>>;
  baseParams: P;
  limit?: number;
  enabled?: boolean;
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
  T extends { id: string },
  P extends Record<string, unknown>,
>(options: UsePaginatedListOptions<T, P>): UsePaginatedListResult<T> {
  const { fetchFn, baseParams, limit = DEFAULT_LIMIT, enabled = true } = options;

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
    loadPage(1, 'initial');
    // baseParamsKey changes drive reload, loadPage already depends on it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseParamsKey, enabled]);

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
