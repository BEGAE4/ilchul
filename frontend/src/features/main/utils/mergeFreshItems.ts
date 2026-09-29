/**
 * 뒤로가기로 복원한 목록(cached)을 새로 받은 값(fresh)으로 갱신한다.
 * 순서·개수는 복원한 그대로 두어 스크롤 위치가 흔들리지 않게 하고, 같은 id 의 필드(좋아요 수 등)만 바꾼다.
 * 바뀐 항목이 없으면 원래 배열을 그대로 돌려준다.
 */
export function mergeFreshItems<T extends { id: string | number }>(cached: T[], fresh: T[]): T[] {
  const freshById = new Map(fresh.map((item) => [String(item.id), item]));
  let changed = false;
  const merged = cached.map((item) => {
    const next = freshById.get(String(item.id));
    if (!next || JSON.stringify(next) === JSON.stringify(item)) return item;
    changed = true;
    return next;
  });
  return changed ? merged : cached;
}
