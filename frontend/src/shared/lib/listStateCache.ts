// 목록 화면의 누적 상태(무한 스크롤로 불러온 아이템·페이지·총계)를 세션에 저장/복원한다.
// 뒤로가기로 목록에 돌아왔을 때 페이지2 이후 데이터가 사라지지 않도록 하기 위한 캐시.
// sessionStorage 기반이라 탭을 닫으면 사라지며, 실패는 조용히 무시한다.

const PREFIX = 'ilchul:list:';
const DEFAULT_TTL = 10 * 60 * 1000; // 10분

export interface CachedListState<T> {
  items: T[];
  page: number;
  hasNext: boolean;
  totalCount: number;
  savedAt: number;
}

export function saveListState<T>(
  key: string,
  state: { items: T[]; page: number; hasNext: boolean; totalCount: number }
): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: CachedListState<T> = { ...state, savedAt: Date.now() };
    sessionStorage.setItem(PREFIX + key, JSON.stringify(payload));
  } catch {
    /* 용량 초과 등은 무시 */
  }
}

export function readListState<T>(key: string, ttl: number = DEFAULT_TTL): CachedListState<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedListState<T>;
    if (!parsed || !Array.isArray(parsed.items)) return null;
    if (Date.now() - parsed.savedAt > ttl) {
      sessionStorage.removeItem(PREFIX + key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearListState(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {
    /* 무시 */
  }
}
