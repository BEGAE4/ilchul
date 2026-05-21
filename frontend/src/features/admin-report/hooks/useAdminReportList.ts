'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { fetchAdminReports } from '../api';
import type {
  AdminReportListItem,
  AdminReportListParams,
  AdminReportSort,
} from '../types';
import type { ReportReasonCode, ReportStatus, ReportTargetType } from '@/features/report';

const DEFAULT_SIZE = 20;

const STATUS_VALUES: ReadonlyArray<ReportStatus | 'all'> = [
  'all',
  'PENDING',
  'REVIEWING',
  'RESOLVED',
  'REJECTED',
];

const TARGET_VALUES: ReadonlyArray<ReportTargetType | 'all'> = [
  'all',
  'course',
  'comment',
  'user',
];

const REASON_VALUES: ReadonlyArray<ReportReasonCode | 'all'> = [
  'all',
  'SPAM_AD',
  'FAKE_INFO',
  'OBSCENE',
  'ABUSE',
  'COPYRIGHT',
  'IMPROPER_PROFILE',
  'IMPERSONATION',
  'PERSONAL_INFO_LEAK',
  'ETC',
];

const SORT_VALUES: ReadonlyArray<AdminReportSort> = [
  'createdAt:desc',
  'createdAt:asc',
  'reportCount:desc',
];

function pickEnum<T extends string>(raw: string | null, allowed: ReadonlyArray<T>, fallback: T): T {
  return raw && (allowed as ReadonlyArray<string>).includes(raw) ? (raw as T) : fallback;
}

function parseFilters(sp: URLSearchParams): Required<Omit<AdminReportListParams, 'autoBlindedOnly'>> & { autoBlindedOnly: boolean } {
  return {
    status: pickEnum(sp.get('status'), STATUS_VALUES, 'all'),
    targetType: pickEnum(sp.get('targetType'), TARGET_VALUES, 'all'),
    reasonCode: pickEnum(sp.get('reasonCode'), REASON_VALUES, 'all'),
    q: sp.get('q') ?? '',
    page: Number(sp.get('page')) || 1,
    size: Number(sp.get('size')) || DEFAULT_SIZE,
    sort: pickEnum(sp.get('sort'), SORT_VALUES, 'createdAt:desc'),
    autoBlindedOnly: sp.get('autoBlindedOnly') === 'true',
  };
}

export function useAdminReportList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchString = searchParams?.toString() ?? '';

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchString)),
    [searchString],
  );

  const [data, setData] = useState<AdminReportListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setIsError(false);
    fetchAdminReports(filters, controller.signal)
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
    (next: Partial<AdminReportListParams>) => {
      const sp = new URLSearchParams(searchString);
      Object.entries(next).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === '' ||
          value === 'all' ||
          value === false
        ) {
          sp.delete(key);
        } else {
          sp.set(key, String(value));
        }
      });
      // 필터가 바뀌면 page 리셋. page 자체를 변경한 경우는 제외.
      const keys = Object.keys(next);
      if (!(keys.length === 1 && keys[0] === 'page')) {
        sp.delete('page');
      }
      router.replace(`/admin/reports?${sp.toString()}`, { scroll: false });
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
