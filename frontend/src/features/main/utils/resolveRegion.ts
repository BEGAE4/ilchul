import { REGIONS, type Region } from '../constants/regions';

/**
 * 좌표에서 가장 가까운 시/도를 고른다.
 *
 * 카카오 역지오코딩 대신 17개 대표 좌표와의 거리 비교로 판정한다.
 * 시/도 단위만 있으면 충분한데 지도 SDK 를 홈에서 새로 불러오는 비용이 크고,
 * 이 방식은 네트워크 없이 즉시 끝난다.
 */
const MAX_DISTANCE_KM = 250;
const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** 두 좌표 사이 대권 거리(km) */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(s)));
}

function isValidCoord(c: { lat: number; lng: number }): boolean {
  return (
    Number.isFinite(c.lat) &&
    Number.isFinite(c.lng) &&
    c.lat >= -90 &&
    c.lat <= 90 &&
    c.lng >= -180 &&
    c.lng <= 180
  );
}

/**
 * 가장 가까운 지역. 좌표가 없거나 국내에서 너무 멀면(해외·바다) null 을 돌려주고,
 * 호출부가 기본 지역으로 떨어뜨린다.
 */
export function resolveRegionByCoord(
  coord: { lat: number; lng: number } | null | undefined
): Region | null {
  if (!coord || !isValidCoord(coord)) return null;

  let best: Region | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const region of REGIONS) {
    // 대표 좌표 + 판정용 보조 좌표 중 가장 가까운 것을 그 지역까지의 거리로 본다
    let d = distanceKm(coord, region);
    for (const [lat, lng] of region.detectAnchors ?? []) {
      d = Math.min(d, distanceKm(coord, { lat, lng }));
    }
    if (d < bestDistance) {
      bestDistance = d;
      best = region;
    }
  }
  return bestDistance <= MAX_DISTANCE_KM ? best : null;
}
