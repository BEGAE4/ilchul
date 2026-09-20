import type { Region } from '../constants/regions';
import type { NearbyQuery } from '../types';

/**
 * 지역 → 주변 목록(`/api/place/popular`·`/api/plan/popular`) 조회 조건.
 *
 * 지역명으로 조회한다. 이전에는 지역의 대표 좌표 반경 10km 로 조회해서, 등록된 장소가
 * 대표 좌표에서 먼 지역은 빈 화면이 됐다(충남 → 천안 좌표, 실제 장소는 태안·보령).
 * 세종은 반대로 대전 장소가 섞여 나왔다.
 *
 * 서버는 화면에 보이는 짧은 이름("충남", "강원")을 그대로 받는다 — 주소 표기가
 * "강원특별자치도"·"전북특별자치도" 여도 서버가 맞춰 준다(2026-09-19 운영 17개 지역 확인).
 * 화면 이름과 서버 지역명이 다른 항목("광주·전남" → "전남")은 queryName 을 보낸다.
 */
export function buildNearbyQuery(region: Region): NearbyQuery {
  return { region: region.queryName ?? region.name };
}
