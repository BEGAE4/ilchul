export interface PopularPlace {
  id: string;
  name: string;
  category: string;
  location: string;
  image: string;
  // 백엔드 PopularPlaceItemDto에 아직 없는 필드 (api-docs v5 기준)
  likes?: number;
  ranking: number;
}
