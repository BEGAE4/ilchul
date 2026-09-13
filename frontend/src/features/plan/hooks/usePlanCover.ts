import { useEffect, useState } from 'react';
import { loadPlanCover } from '../utils/planCoverCache';

// 목록 카드용 대표 이미지. 목록 응답이 준 이미지(initial)가 있으면 그대로 쓰고 요청하지 않는다.
// 없을 때만 플랜 상세를 조회해(캐시됨) 상세 히어로와 같은 규칙으로 고른 이미지를 돌려준다.
// 조회 중·실패·끝까지 없음은 모두 null → CoverImage 가 기본 커버를 그린다. 오류는 화면에 띄우지 않는다.
export function usePlanCover(planId: number, initial: string | null | undefined): string | null {
  const given = (initial ?? '').trim() || null;
  const [fetched, setFetched] = useState<string | null>(null);

  useEffect(() => {
    if (given) return;
    let cancelled = false;
    loadPlanCover(planId).then((src) => {
      if (!cancelled) setFetched(src);
    });
    return () => {
      cancelled = true;
    };
  }, [planId, given]);

  return given ?? fetched;
}
