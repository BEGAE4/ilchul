// 화면 라우트의 id(string)를 서버 placeId(number)로 변환한다.
// 목데이터 id(`bp-...`, `place-...` 등)는 서버에 존재하지 않으므로 null을 반환한다.
export function toNumericPlaceId(id: string): number | null {
  if (!/^\d+$/.test(id)) return null;
  return Number(id);
}
