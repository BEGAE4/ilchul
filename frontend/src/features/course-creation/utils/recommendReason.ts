// AI 장소 추천 응답의 플랜 전체 이유(plan.reasoning)를 다룬다.
// 장소별 이유(items[].reason)는 recommendedPlaces.ts 가 카드 설명으로 옮긴다.

/** 응답에서 plan.reasoning 을 꺼낸다. 없거나 비어 있으면 '' — 화면은 그때 영역을 그리지 않는다. */
export function extractRecommendReasoning(data: unknown): string {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return '';
  const plan = (data as { plan?: unknown }).plan;
  if (!plan || typeof plan !== 'object') return '';
  const reasoning = (plan as { reasoning?: unknown }).reasoning;
  return typeof reasoning === 'string' ? reasoning.trim() : '';
}

// 추천 이유 줄은 기본이 펼침이다. 사용자가 접으면 그 선택을 기억해 다음 추천에서도 접힌 채로 보여준다.
const COLLAPSED_KEY = 'ilchul:recommend-reason-collapsed';

export function readReasonCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeReasonCollapsed(collapsed: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (collapsed) localStorage.setItem(COLLAPSED_KEY, '1');
    else localStorage.removeItem(COLLAPSED_KEY);
  } catch {
    /* 저장 불가 환경은 무시 — 이번 화면에서만 접힌다 */
  }
}
