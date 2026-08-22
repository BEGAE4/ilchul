import type { Place } from '@/shared/types';

// 추천 응답은 "키워드별로 묶인 그룹"의 배열이다 (BE RecommendPlaceResponseDto).
//   [{ keyword: '카페', radiusM: 2000, places: [{ placeId, placeName, ... }] }]
// 이전 구현은 평면 장소 배열을 기대해 그룹 객체에서 placeId/placeName을 찾지 못했고,
// 결과적으로 서버 추천을 전량 버리고 목데이터로 폴백하고 있었다.
// 명세(260819)의 응답 타입이 여전히 비어 있어 서버가 평면 배열로 바뀔 여지가 있으므로 두 모양을 모두 받는다.

// 키워드 하나가 목록을 독차지하지 않도록 그룹마다 상위 N개만 쓴다.
// 카카오 키워드 검색이 키워드당 최대 15건을 주므로, 그대로 이으면 모바일에서 40건이 넘는 목록이 된다.
const MAX_PLACES_PER_KEYWORD = 5;

// 추천 응답(SearchPlaceResponseDto)에는 체류시간이 없다.
// 선택 화면의 총 소요시간 계산이 이 값을 기준으로 하므로 빈 값을 두면 계산이 0이 된다.
const DEFAULT_STAY_TIME = '60분';

// 비어 있지 않은 첫 문자열을 고른다 — 서버가 필드명을 바꿔도 후보를 나열해 흡수한다.
function pickString(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return '';
}

function toPlace(raw: unknown, keyword?: string): Place | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = item.placeId ?? item.id;
  const name = pickString(item.placeName, item.name);
  if (id === undefined || id === null || !name) return null;

  // 좌표: 응답이 location { x, y } 또는 평면 x/y 어느 쪽이든 수용 (x=경도, y=위도)
  const loc =
    item.location && typeof item.location === 'object'
      ? (item.location as Record<string, unknown>)
      : undefined;
  const x = typeof item.x === 'number' ? item.x : typeof loc?.x === 'number' ? loc.x : undefined;
  const y = typeof item.y === 'number' ? item.y : typeof loc?.y === 'number' ? loc.y : undefined;

  // 카카오 카테고리는 '음식점 > 카페 > 커피전문점' 형태라 배지에 그대로 넣으면 줄이 터진다. 끝 항목만 쓴다.
  const rawCategory = pickString(item.categoryName, item.category);
  const category = rawCategory.split('>').pop()?.trim() || '추천 장소';

  return {
    id: String(id),
    name,
    category,
    time: pickString(item.time) || DEFAULT_STAY_TIME,
    // description/phone/tags는 추천 응답에 없는 필드다. 없으면 화면에서 해당 영역을 감춘다.
    description: pickString(item.description),
    image: pickString(item.placeImageUrl, item.image),
    address: pickString(item.addressName, item.roadAddressName, item.address),
    phone: pickString(item.phone),
    // 태그 대신 "어떤 키워드로 걸린 장소인지"를 넣는다 — 추천 이유를 보여줄 유일한 단서다.
    tags: Array.isArray(item.tags)
      ? item.tags.filter((t): t is string => typeof t === 'string')
      : keyword
        ? [`#${keyword}`]
        : [],
    ...(x !== undefined && y !== undefined ? { coord: { lat: y, lng: x } } : {}),
  };
}

export function mapRecommendedPlaces(data: unknown): Place[] {
  if (!Array.isArray(data)) return [];

  // 1) 그룹 배열로 정규화 — 평면 배열이 오면 키워드 없는 한 덩어리로 취급한다.
  const groups: { keyword?: string; places: unknown[] }[] = [];
  for (const entry of data) {
    const obj = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : null;
    if (obj && Array.isArray(obj.places)) {
      groups.push({
        keyword: typeof obj.keyword === 'string' ? obj.keyword : undefined,
        places: obj.places,
      });
    } else {
      const last = groups[groups.length - 1];
      if (last && last.keyword === undefined) last.places.push(entry);
      else groups.push({ places: [entry] });
    }
  }

  // 2) 그룹마다 상위 N개만 남긴다.
  const buckets = groups.map((g) =>
    g.places
      .map((p) => toPlace(p, g.keyword))
      .filter((p): p is Place => p !== null)
      .slice(0, MAX_PLACES_PER_KEYWORD)
  );

  // 3) 라운드로빈으로 섞어 모든 키워드가 목록 앞쪽에 고르게 보이게 한다.
  //    키워드가 겹치면 같은 장소가 여러 그룹에 들어오므로 placeId로 중복을 제거한다.
  const seen = new Set<string>();
  const merged: Place[] = [];
  const depth = buckets.reduce((max, b) => Math.max(max, b.length), 0);
  for (let i = 0; i < depth; i++) {
    for (const bucket of buckets) {
      const place = bucket[i];
      if (!place || seen.has(place.id)) continue;
      seen.add(place.id);
      merged.push(place);
    }
  }
  return merged;
}
