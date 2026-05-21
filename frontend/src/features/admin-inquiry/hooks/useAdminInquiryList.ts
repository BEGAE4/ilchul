'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { fetchAdminInquiries } from '../api';
import type {
  AdminInquiryListItem,
  AdminInquiryListParams,
  AdminInquirySort,
  InquiryCategory,
  InquiryStatus,
} from '../types';

const DEFAULT_SIZE = 20;

const STATUS_VALUES: ReadonlyArray<InquiryStatus | 'all'> = [
  'all',
  'OPEN',
  'ANSWERED',
  'CLOSED',
];

const CATEGORY_VALUES: ReadonlyArray<InquiryCategory | 'all'> = [
  'all',
  'ACCOUNT',
  'CONTENT',
  'REPORT_APPEAL',
  'BUG',
  'FEATURE',
  'ETC',
];

const SORT_VALUES: ReadonlyArray<AdminInquirySort> = [
  'createdAt:desc',
  'updatedAt:desc',
];

function pickEnum<T extends string>(raw: string | null, allowed: ReadonlyArray<T>, fallback: T): T {
  return raw && (allowed as ReadonlyArray<string>).includes(raw) ? (raw as T) : fallback;
}

function parseFilters(sp: URLSearchParams): Required<AdminInquiryListParams> {
  return {
    status: pickEnum(sp.get('status'), STATUS_VALUES, 'all'),
    category: pickEnum(sp.get('category'), CATEGORY_VALUES, 'all'),
    q: sp.get('q') ?? '',
    page: Number(sp.get('page')) || 1,
    size: Number(sp.get('size')) || DEFAULT_SIZE,
    sort: pickEnum(sp.get('sort'), SORT_VALUES, 'createdAt:desc'),
  };
}

export function useAdminInquiryList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchString = searchParams?.toString() ?? '';

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchString)),
    [searchString],
  );

  const [data, setData] = useState<AdminInquiryListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setIsError(false);
    fetchAdminInquiries(filters, controller.signal)
      .then((res) => {
        setData(res.data);
        setTotalCount(res.totalCount);
        setHasNext(res.hasNext);
      })
      .catch((err: unknown) => {
        if (axios.isCancel(err)) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [filters]);

  const setFilters = useCallback(
    (next: Partial<AdminInquiryListParams>) => {
      const sp = new URLSearchParams(searchString);
      Object.entries(next).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === '' ||
          value === 'all'
        ) {
          sp.delete(key);
        } else {
          sp.set(key, String(value));
        }
      });
      const keys = Object.keys(next);
      if (!(keys.length === 1 && keys[0] === 'page')) {
        sp.delete('page');
      }
      router.replace(`/admin/inquiries?${sp.toString()}`, { scroll: false });
    },
    [router, searchString],
  );

  return {
    data,
    totalCount,
    hasNext,
    isLoading,
    isError,
    filters,
    setFilters,
  };
}
