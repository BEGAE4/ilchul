import type { Region } from '../constants/regions';
import type { NearbyQuery } from '../types';

/**
 * 주변 목록을 지역명으로 조회할지 여부.
 *
 * 백엔드 `/api/place/popular`·`/api/plan/popular` 가 아직 lat/lng 만 받는다
 * (region 만 보내면 400). 지역명 조회가 배포되면 NEXT_PUBLIC_NEARBY_REGION_QUERY=true 로 켠다.
 */
export const NEARBY_REGION_QUERY_ENABLED =
  process.env.NEXT_PUBLIC_NEARBY_REGION_QUERY === 'true';

/**
 * 서버에 보낼 지역명. 주소 앞머리(예: "서울 중구 …")와 맞춰야 하므로,
 * 백엔드와 표기(서울/서울특별시, 강원/강원특별자치도 등)가 정해지면 여기만 고친다.
 */
export function toRegionQueryName(region: Region): string {
  return region.name;
}

/** 지역 → 주변 목록 조회 조건. 플래그가 꺼져 있으면 지금처럼 대표 좌표로 조회한다. */
export function buildNearbyQuery(
  region: Region,
  useRegionName: boolean = NEARBY_REGION_QUERY_ENABLED
): NearbyQuery {
  if (useRegionName) return { region: toRegionQueryName(region) };
  return { lat: region.lat, lng: region.lng };
}
