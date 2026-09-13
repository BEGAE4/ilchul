import * as planApi from '../api/plan.api';
import { pickPlanCover } from './pickPlanCover';

// 목록 응답(마이페이지 내 플랜·저장한 플랜)에 대표 이미지가 없을 때 플랜 상세를 한 번 조회해
// 상세 히어로와 같은 규칙(pickPlanCover)으로 이미지를 고른다.
// 같은 플랜을 여러 카드·여러 탭에서 동시에 물어봐도 상세 조회는 한 번만 나가도록 Promise 를 캐시한다.
// 실패(비공개 전환·네트워크)는 null 로 삼키고 캐시에서 지워 다음 마운트 때 다시 시도한다.
const cache = new Map<number, Promise<string | null>>();

export function loadPlanCover(planId: number): Promise<string | null> {
  const hit = cache.get(planId);
  if (hit) return hit;

  const p = planApi
    .fetchPlanDetail(planId)
    .then((detail) => pickPlanCover(detail))
    .catch(() => {
      cache.delete(planId);
      return null;
    });
  cache.set(planId, p);
  return p;
}

export function resetPlanCoverCache(): void {
  cache.clear();
}
