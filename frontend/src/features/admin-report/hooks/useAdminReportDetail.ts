'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  fetchAdminReportDetail,
  patchAdminReportStatus as patchApi,
} from '../api';
import type { AdminReportDetail } from '../types';

interface PatchBody {
  status: 'REVIEWING' | 'REJECTED';
  note?: string;
}

export function useAdminReportDetail(reportId: string) {
  const [data, setData] = useState<AdminReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setIsError(false);
    fetchAdminReportDetail(reportId, controller.signal)
      .then(setData)
      .catch((err: unknown) => {
        if (axios.isCancel(err)) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [reportId]);

  const refetch = useCallback(async () => {
    try {
      const fresh = await fetchAdminReportDetail(reportId);
      setData(fresh);
    } catch {
      setIsError(true);
    }
  }, [reportId]);

  const patchStatus = useCallback(
    async (body: PatchBody) => {
      const updated = await patchApi(reportId, body);
      setData(updated);
      return updated;
    },
    [reportId],
  );

  return { data, isLoading, isError, refetch, patchStatus, setData };
}
