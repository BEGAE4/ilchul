import type { PlanDetail } from '../types/plan.types';

// 플랜 대표 이미지 선택 규칙 — 상세 히어로와 목록 카드가 같은 사진을 보여주도록 한 곳에 둔다.
// 업로드 썸네일 → 사용자가 기록으로 올린 플랜 사진 첫 장 → 방문 순서상 첫 번째로 사진이 있는 장소.
// 모두 없으면 null 을 돌려주고, 화면은 CoverImage 의 기본 커버를 그린다.
export function pickPlanCover(plan: PlanDetail): string | null {
  if (plan.thumbnailUrl) return plan.thumbnailUrl;

  const planImages = Array.isArray(plan.planImageUrls) ? plan.planImageUrls : [];
  if (planImages[0]) return planImages[0];

  const places = Array.isArray(plan.planPlaceDetailDtos) ? [...plan.planPlaceDetailDtos] : [];
  places.sort((a, b) => a.orderIndex - b.orderIndex);
  return places.find((p) => p.placeImage)?.placeImage ?? null;
}
