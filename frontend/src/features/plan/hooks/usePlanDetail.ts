import { useState, useEffect, useCallback } from 'react';
import * as planApi from '../api/plan.api';
import type { PlanDetail } from '../types/plan.types';
import { toNumericPlanId } from '../utils/planId';
import { toPlanErrorMessage, type PlanErrorKind } from '../utils/planErrorMessage';

// 플랜 상세를 서버에서 조회한다. 실패하거나 planId가 유효하지 않으면
// plan은 null, error에 문구·errorKind에 종류가 담기며 화면에서 에러 UI를 렌더링한다.
export function usePlanDetail(planId: string) {
  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<PlanErrorKind | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const numericId = toNumericPlanId(planId);
    if (numericId === null) {
      setPlan(null);
      setError('존재하지 않거나 삭제된 플랜이에요.');
      setErrorKind('not_found');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        setErrorKind(null);
        const detail = await planApi.fetchPlanDetail(numericId);
        if (!cancelled) setPlan(detail);
      } catch (err) {
        if (!cancelled) {
          const { kind, message } = toPlanErrorMessage(err);
          setPlan(null);
          setError(message);
          setErrorKind(kind);
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

  return { plan, isLoading, error, errorKind, refetch };
}
