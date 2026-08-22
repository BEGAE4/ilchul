import { useState, useEffect, useCallback } from 'react';
import * as planApi from '../api/plan.api';
import type { PlanDetail } from '../types/plan.types';
import { toNumericPlanId } from '../utils/planId';

// 플랜 상세를 서버에서 조회한다. 실패하거나 planId가 유효하지 않으면
// plan은 null, error에 사유가 담기며 화면에서 에러 UI를 렌더링한다.
export function usePlanDetail(planId: string) {
  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const numericId = toNumericPlanId(planId);
    if (numericId === null) {
      setPlan(null);
      setError('플랜을 찾을 수 없습니다.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const detail = await planApi.fetchPlanDetail(numericId);
        if (!cancelled) setPlan(detail);
      } catch {
        if (!cancelled) {
          setPlan(null);
          setError('플랜 정보를 불러오지 못했어요.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [planId, reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { plan, isLoading, error, refetch };
}
