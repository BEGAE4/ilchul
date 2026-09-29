// 플랜을 방금 만들고 들어온 상세 화면에서는 뒤로가기가 마이페이지 플랜 목록으로 가야 한다.
// 생성 화면은 저장과 함께 초기화되므로, 기록대로 돌아가면 빈 설문 첫 단계가 나온다.
// 어떤 플랜이 "방금 만든 것"인지 세션에 표시해 두고 상세 화면이 읽는다.
// sessionStorage 기반이라 탭을 닫으면 사라지며, 실패는 조용히 무시한다.

const KEY = 'ilchul:created-plan-back';

/** 뒤로가기로 보낼 곳 — 마이페이지는 기본 탭이 내 플랜 목록이다 */
export const CREATED_PLAN_BACK_TARGET = '/profile';

export interface CreatedPlanBack {
  planId: string;
  /** 뒤로가기를 가로채기 위한 기록을 이미 쌓았는지 — 상세로 다시 들어와도 중복으로 쌓지 않는다 */
  guardPushed: boolean;
}

function write(value: CreatedPlanBack): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* 저장 불가 환경에서는 평소처럼 뒤로 간다 */
  }
}

export function markPlanJustCreated(planId: string | number): void {
  write({ planId: String(planId), guardPushed: false });
}

/** 이 상세 화면이 방금 만든 플랜이면 표시를 돌려준다. 아니면 null. */
export function readCreatedPlanBack(planId: string | number): CreatedPlanBack | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CreatedPlanBack>;
    if (!parsed || parsed.planId !== String(planId)) return null;
    return { planId: parsed.planId, guardPushed: parsed.guardPushed === true };
  } catch {
    return null;
  }
}

export function markBackGuardPushed(planId: string | number): void {
  write({ planId: String(planId), guardPushed: true });
}

export function clearCreatedPlanBack(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* 무시 */
  }
}
