import type { Place } from '@/shared/types';
import type { RecommendResponse } from '@/features/place/types/place.types';

// 추천 응답(확정, 260822)은 AI가 순서까지 정한 플랜 객체다.
//   { recommendId, candidateCount, plan, items: [{ order, placeId, placeName, stayMinutes, reason, tags, ... }] }
// 이전 구현은 키워드별 그룹 배열을 기대해 객체 응답을 통째로 버리고 목데이터로 폴백하고 있었다.

// 응답에 체류시간이 없거나 0 이하일 때 쓰는 값. 선택 화면의 총 소요시간 계산이 time을 기준으로 한다.
const DEFAULT_STAY_MINUTES = 60;

// 비어 있지 않은 첫 문자열을 고른다 — 서버가 필드명을 바꿔도 후보를 나열해 흡수한다.
function pickString(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return '';
}

function toPlace(raw: unknown): Place | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = item.placeId ?? item.id;
  const name = pickString(item.placeName, item.name);
  if (id === undefined || id === null || !name) return null;

  // 좌표: x=경도, y=위도
  const x = typeof item.x === 'number' ? item.x : undefined;
  const y = typeof item.y === 'number' ? item.y : undefined;

  // 카카오 카테고리는 '음식점 > 카페 > 커피전문점' 형태라 배지에 그대로 넣으면 줄이 터진다. 끝 항목만 쓴다.
  const rawCategory = pickString(item.categoryName, item.category);
  const category = rawCategory.split('>').pop()?.trim() || '추천 장소';

  const stayMinutes =
    typeof item.stayMinutes === 'number' && item.stayMinutes > 0
      ? item.stayMinutes
      : DEFAULT_STAY_MINUTES;

  return {
    id: String(id),
    name,
    category,
    // 선택 화면은 '90분' 같은 문자열에서 숫자를 뽑아 합산한다 (parseStayMinutes)
    time: `${stayMinutes}분`,
    // AI가 이 장소를 고른 이유를 설명으로 보여준다
    description: pickString(item.reason, item.description),
    image: pickString(item.placeImageUrl, item.image),
    address: pickString(item.roadAddressName, item.addressName, item.address),
    phone: pickString(item.phone),
    tags: Array.isArray(item.tags)
      ? item.tags.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
      : [],
    ...(x !== undefined && y !== undefined ? { coord: { lat: y, lng: x } } : {}),
  };
}

// 응답 객체의 items를 order 순으로 정렬해 Place 목록으로 바꾼다.
// 방어적으로 평면 배열이 오더라도 그대로 받아준다.
export function mapRecommendedPlaces(data: RecommendResponse | unknown): Place[] {
  const items: unknown[] = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)
      ? ((data as { items: unknown[] }).items)
      : [];

  const orderOf = (raw: unknown): number => {
    const o = raw && typeof raw === 'object' ? (raw as { order?: unknown }).order : undefined;
    return typeof o === 'number' ? o : Number.MAX_SAFE_INTEGER;
  };

  const seen = new Set<string>();
  const result: Place[] = [];
  for (const raw of [...items].sort((a, b) => orderOf(a) - orderOf(b))) {
    const place = toPlace(raw);
    if (!place || seen.has(place.id)) continue;
    seen.add(place.id);
    result.push(place);
  }
  return result;
}
