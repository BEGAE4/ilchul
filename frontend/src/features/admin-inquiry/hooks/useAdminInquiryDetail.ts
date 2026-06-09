'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  fetchAdminInquiryDetail,
  patchAdminInquiryStatus as patchApi,
} from '../api';
import type { AdminInquiryDetail, InquiryStatus } from '../types';

export function useAdminInquiryDetail(inquiryId: string) {
  const [data, setData] = useState<AdminInquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setIsError(false);
    fetchAdminInquiryDetail(inquiryId, controller.signal)
      .then(setData)
      .catch((err: unknown) => {
        if (axios.isCancel(err)) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [inquiryId]);

  const refetch = useCallback(async () => {
    try {
      const fresh = await fetchAdminInquiryDetail(inquiryId);
      setData(fresh);
    } catch {
      setIsError(true);
    }
  }, [inquiryId]);

  const patchStatus = useCallback(
    async (status: InquiryStatus) => {
      const updated = await patchApi(inquiryId, { status });
      setData(updated);
      return updated;
    },
    [inquiryId],
  );

  return { data, isLoading, isError, refetch, patchStatus, setData };
}
