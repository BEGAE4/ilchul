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
  /** 이 목록을 받아온 조회 조건(지역 등). 조건이 다른 화면에서 복원되지 않게 한다. */
  paramsKey?: string;
}

export function saveListState<T>(
  key: string,
  state: { items: T[]; page: number; hasNext: boolean; totalCount: number },
  paramsKey?: string
): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: CachedListState<T> = { ...state, savedAt: Date.now(), paramsKey };
    sessionStorage.setItem(PREFIX + key, JSON.stringify(payload));
  } catch {
    /* 용량 초과 등은 무시 */
  }
}

interface ReadOptions {
  ttl?: number;
  /**
   * 지금 화면의 조회 조건. 지정하면 같은 조건으로 저장된 목록만 복원한다.
   * 같은 key 를 지역만 바꿔 쓰는 목록(주변 인기 장소·플랜)에서 이전 지역 목록이 뜨던 문제를 막는다.
   */
  paramsKey?: string;
}

export function readListState<T>(key: string, options: ReadOptions = {}): CachedListState<T> | null {
  const { ttl = DEFAULT_TTL, paramsKey } = options;
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
    if (paramsKey !== undefined && parsed.paramsKey !== paramsKey) return null;
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
