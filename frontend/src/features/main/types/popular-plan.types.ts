export interface PopularPlan {
  // NOTE: v6 PopularPlanItemDto.id는 int32이나, 프론트 도메인(Course)·mock catalog가
  // string id에 결합되어 있어 number 전환은 별도 작업으로 분리(도메인 타입 동반 정리 필요).
  // 런타임은 key/`/course/${id}` 모두 문자열 강제라 무해.
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  location: string;
  duration: string;
  // 백엔드 PopularPlanItemDto에 없는 필드 (v6 기준)
  tags?: string[];
  likes: number;
  ranking: number;
}
