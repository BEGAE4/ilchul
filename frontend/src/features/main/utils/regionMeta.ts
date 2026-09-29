import type { RegionMeta, RegionSigunguMeta } from '../types';

// 서버 지역 메타(GET /api/region)를 프론트 지역 항목(REGIONS.name)에 붙인다.
// 서버 name 이 프론트 이름과 같게 오고("광주·전남" 포함), 혹시 다르면 aliases 로도 찾는다.
export function indexRegionMeta(list: RegionMeta[]): Record<string, RegionMeta> {
  const byName: Record<string, RegionMeta> = {};
  for (const meta of list) {
    if (!meta || typeof meta.name !== 'string') continue;
    byName[meta.name] = meta;
    for (const alias of meta.aliases ?? []) {
      if (typeof alias === 'string' && !byName[alias]) byName[alias] = meta;
    }
  }
  return byName;
}

/** 시트에 보여줄 시군구 — 장소가 있는 곳만, 많은 순. 이름 순은 두 번째 기준. */
export function pickSigunguChips(meta: RegionMeta | undefined): RegionSigunguMeta[] {
  if (!meta || !Array.isArray(meta.sigungu)) return [];
  return meta.sigungu
    .filter((s) => s && typeof s.sigungu === 'string' && s.placeCount > 0)
    .sort((a, b) => b.placeCount - a.placeCount || a.sigungu.localeCompare(b.sigungu, 'ko'));
}

/** 고른 시군구 중 지금 메타에 없는(장소가 0이 된) 항목은 걷어낸다 */
export function pruneSigungu(selected: string[], meta: RegionMeta | undefined): string[] {
  if (!meta) return selected;
  const valid = new Set(pickSigunguChips(meta).map((s) => s.sigungu));
  return selected.filter((s) => valid.has(s));
}
