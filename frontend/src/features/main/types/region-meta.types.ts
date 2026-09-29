// GET /api/region — 시/도 목록과 시군구·장소 수 (2026-09-29 백엔드 추가)
export interface RegionSigunguMeta {
  sigungu: string;
  placeCount: number;
}

export interface RegionMeta {
  /** 서버가 받는 지역 키 (예: "서울", "광주·전남") */
  region: string;
  /** 화면 이름 — 프론트 REGIONS 의 name 과 같다 */
  name: string;
  aliases: string[];
  placeCount: number;
  sigungu: RegionSigunguMeta[];
}

export interface RegionMetaResponse {
  regions: RegionMeta[];
}
