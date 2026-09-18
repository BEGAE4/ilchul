// 인기 플랜 항목 (PopularPlanItemDto) — 명세 기준 id는 int32.
// place feature의 PlaceContainingPlan 과 동일 DTO를 모델링한다(동일 필드 유지).
export interface PopularPlan {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  location: string;
  duration: string;
  likes: number;
  ranking: number;
}
