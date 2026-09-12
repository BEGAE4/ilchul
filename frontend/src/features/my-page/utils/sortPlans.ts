// 마이페이지 플랜 목록 정렬 — 최근 것이 위로.

// 서버 날짜는 'yyyy-MM-dd HH:mm' 형식이라 Safari/iOS 가 그대로는 못 읽는다. ISO(T)로 정규화해 비교하고,
// 없거나 읽을 수 없는 값은 맨 아래로 보낸다.
function toTime(value: string | null | undefined): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const t = new Date(value.replace(' ', 'T')).getTime();
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
}

interface Created {
  planId: number;
  createAt: string | null;
}

/** 내 플랜 — 생성일 최신순. 같은 시각이면 id 가 큰(나중에 만든) 플랜이 위로. */
export function sortMyPlansNewest<T extends Created>(plans: T[]): T[] {
  return [...plans].sort(
    (a, b) => toTime(b.createAt) - toTime(a.createAt) || b.planId - a.planId
  );
}

interface Scrapped {
  planId: number;
  scrappedAt?: string | null;
}

/**
 * 저장 플랜 — 저장한 시각 최신순.
 *
 * 응답(ScrappedPlanSummary, v6)에는 저장 시각이 없고 createAt 은 플랜이 만들어진 날이라,
 * 그걸로 정렬하면 "저장 최신순"이 아니라 "남이 플랜을 만든 순"이 된다. 그래서 저장 시각
 * (scrappedAt)이 오는 항목끼리만 정렬하고, 없으면 서버가 준 순서를 그대로 둔다.
 * 백엔드에 scrappedAt 추가를 요청해 두었다 — 필드가 오면 이 함수가 그대로 정렬한다.
 */
export function sortScrappedPlansNewest<T extends Scrapped>(plans: T[]): T[] {
  if (!plans.some((p) => p.scrappedAt)) return [...plans];
  return [...plans].sort((a, b) => toTime(b.scrappedAt) - toTime(a.scrappedAt));
}
