import type { PlanDetail } from '../types/plan.types';

// 서버 PlanDetailDto 의 배열 필드는 null 로 올 수 있다.
// 특히 tags 는 백엔드 PlanDetailDto.from() 이 builder 에 .tags(...) 를 호출하지 않아 항상 null 이고,
// 화면(CourseViewPage)이 plan.tags.map / planImageUrls[0] / [...planPlaceDetailDtos] 를 바로 호출해
// 플랜 생성 직후와 마이페이지 카드 클릭에서 "client-side exception" 으로 페이지 전체가 죽었다.
// API 레이어에서 한 번 정규화해 화면이 null 을 신경쓰지 않게 한다.
export function normalizePlanDetail(raw: PlanDetail): PlanDetail {
  return {
    ...raw,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    planImageUrls: Array.isArray(raw.planImageUrls) ? raw.planImageUrls : [],
    planPlaceDetailDtos: Array.isArray(raw.planPlaceDetailDtos) ? raw.planPlaceDetailDtos : [],
  };
}
