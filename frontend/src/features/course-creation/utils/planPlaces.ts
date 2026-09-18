import type { Place } from '@/shared/types';
import type { CreatePlanPlaceRequest, PlanPreviewPlace } from '@/features/plan/types/plan.types';

// 추천 매퍼(recommendedPlaces)가 체류시간을 '90분' 형태로 넣는다. 숫자가 없으면 기본 60분.
export function parseStayMinutes(time: string): number {
  const match = time.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}

// 플랜 생성 요청의 장소 목록. 프리뷰 응답을 order 기준으로 조인해 명세 필수 필드를 채운다.
// 운영 프리뷰 응답에는 stayTime 필드가 없어(2026-09-13 확인) 그대로 쓰면 체류시간이 전부 0으로 저장됐다.
// 프리뷰 값이 없거나 0이면 추천 결과의 체류시간으로 채운다.
export function buildCreatePlanPlaces(
  stops: Place[],
  previewPlaces: PlanPreviewPlace[]
): CreatePlanPlaceRequest[] {
  const previewByOrder = new Map(previewPlaces.map((p) => [p.order, p]));
  return stops
    .map((stop, i) => {
      const order = i + 1;
      const pv = previewByOrder.get(order);
      return {
        placeId: Number(stop.id),
        order,
        travelTime: pv?.duration ?? 0,
        stayTime: pv?.stayTime || parseStayMinutes(stop.time),
      };
    })
    .filter((p) => Number.isInteger(p.placeId));
}
