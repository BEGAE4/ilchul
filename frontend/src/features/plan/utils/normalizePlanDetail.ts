import type { PlanDetail, PlanPlaceDetail } from '../types/plan.types';

// 서버 PlanDetailDto 를 화면이 바로 쓸 수 있는 모양으로 정규화한다. API 레이어에서 한 번만 거친다.
//
// 1) 배열 필드는 null 로 올 수 있다. 특히 tags 는 항상 null 로 와서, 화면이 plan.tags.map /
//    planImageUrls[0] / [...planPlaceDetailDtos] 를 바로 호출해 "client-side exception" 으로 죽은 적이 있다.
// 2) 장소 중복 (QA C-01, 원격 260905 확인): 플랜 사진이 2장 이상이면 planPlaceDetailDtos 가
//    장소 수 × 사진 수만큼 반복돼 온다 (2장소·2사진 → 4건). planPlaceId 기준으로 첫 행만 남긴다.
// 3) 설명 오염 (QA C-02, 원격 260905 확인): 모든 장소의 stayDescription 이 플랜의 planDescription 과
//    같은 문자열로 와서 장소 카드마다 '나의 여행 기록' 문구가 반복됐다.
//    플랜 설명과 같은 값이면 비워서 화면이 주소로 폴백하게 한다.
// 백엔드가 2)·3) 을 고치면 이 정규화는 no-op 이 되므로 그대로 두어도 된다.
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
