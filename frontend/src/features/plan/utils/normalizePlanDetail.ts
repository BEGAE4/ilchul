import type { PlanDetail, PlanPlaceDetail } from '../types/plan.types';

// 서버 PlanDetailDto 를 화면이 바로 쓸 수 있는 모양으로 정규화한다. API 레이어에서 한 번만 거친다.
//
// 1) 배열 필드는 null 로 올 수 있다. 특히 tags 는 항상 null 로 와서, 화면이 plan.tags.map /
//    planImageUrls[0] / [...planPlaceDetailDtos] 를 바로 호출해 "client-side exception" 으로 죽은 적이 있다.
// 2) 장소 중복 (QA C-01): 2026-09-05 에는 planPlaceDetailDtos 가 장소 수 × 사진 수만큼 반복돼 왔다.
//    백엔드가 2026-09-14 고쳤지만, 재발하면 화면이 바로 깨지므로 planPlaceId 기준 중복 제거를 방어로 남긴다.
// 3) 설명 오염 (QA C-02): 2026-09-05 에는 모든 장소의 stayDescription 이 planDescription 과 같았다.
//    2026-09-14 부터는 필드 자체가 오지 않는다(명세에도 없음). 같은 이유로 방어를 남기고, 없으면 '' 로 채운다.
// 정상 응답에서는 2)·3) 모두 no-op 이다.
export function normalizePlanDetail(raw: PlanDetail): PlanDetail {
  const planDescription = (raw.planDescription ?? '').trim();
  const rawPlaces = Array.isArray(raw.planPlaceDetailDtos) ? raw.planPlaceDetailDtos : [];

  const seen = new Set<number>();
  const planPlaceDetailDtos: PlanPlaceDetail[] = [];
  for (const p of rawPlaces) {
    if (seen.has(p.planPlaceId)) continue;
    seen.add(p.planPlaceId);
    const stay = (p.stayDescription ?? '').trim();
    planPlaceDetailDtos.push({
      ...p,
      stayDescription: stay && stay !== planDescription ? p.stayDescription : '',
    });
  }

  return {
    ...raw,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    planImageUrls: Array.isArray(raw.planImageUrls) ? raw.planImageUrls : [],
    planImages: Array.isArray(raw.planImages) ? raw.planImages : [],
    planPlaceDetailDtos,
  };
}
