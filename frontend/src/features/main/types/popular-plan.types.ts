export interface PopularPlan {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  location: string;
  duration: string;
  // 백엔드 PopularPlanItemDto에 아직 없는 필드 (api-docs v5 기준)
  tags?: string[];
  likes: number;
  ranking: number;
}
