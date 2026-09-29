import type { Region } from '../constants/regions';
import type { NearbyQuery } from '../types';

/**
 * 지역(+시군구) → 주변 목록(`/api/place/popular`·`/api/plan/popular`) 조회 조건.
 *
 * 지역명으로 조회한다. 이전에는 지역의 대표 좌표 반경 10km 로 조회해서, 등록된 장소가
 * 대표 좌표에서 먼 지역은 빈 화면이 됐다(충남 → 천안 좌표, 실제 장소는 태안·보령).
 *
 * 서버는 화면에 보이는 짧은 이름("충남", "강원")과 별칭("광주", "전남")을 모두 받는다
 * (2026-09-29 별칭 보강 확인). 화면 이름과 서버 지역명이 다른 항목("광주·전남" → "전남")은 queryName 을 보낸다.
 * 시군구를 골랐으면 쉼표로 이어 `sigungu` 로 보낸다 (2026-09-29 백엔드 추가). 비어 있으면 지역 전체.
 */
export function buildNearbyQuery(region: Region, sigungu: string[] = []): NearbyQuery {
  const base: NearbyQuery = { region: region.queryName ?? region.name };
  const picked = sigungu.map((s) => s.trim()).filter(Boolean);
  return picked.length > 0 ? { ...base, sigungu: picked.join(',') } : base;
}

/** 캐시·스크롤 복원 키에 쓰는 시군구 접미사 — 선택이 다르면 목록도 다르다 */
export function sigunguKey(sigungu: string[]): string {
  return sigungu.length > 0 ? `:${[...sigungu].sort().join('+')}` : '';
}
