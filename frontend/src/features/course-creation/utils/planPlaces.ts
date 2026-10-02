import type { Place } from '@/shared/types';
import type { CreatePlanPlaceRequest, PlanPreviewPlace } from '@/features/plan/types/plan.types';

// 추천 매퍼(recommendedPlaces)가 체류시간을 '90분' 형태로 넣는다. 숫자가 없으면 기본 60분.
export function parseStayMinutes(time: string): number {
  const match = time.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}

// Both identity and order must match; absent route data is never silently saved as zero.
export function buildCreatePlanPlaces(stops: Place[], previewPlaces: PlanPreviewPlace[]): CreatePlanPlaceRequest[] {
  if (stops.length === 0 || stops.length !== previewPlaces.length) throw new Error('preview_mismatch');
  const previewByKey = new Map(previewPlaces.map((p) => [`${p.placeId}:${p.order}`, p]));
  const ids = new Set<number>();
  return stops.map((stop, i) => {
    const placeId = Number(stop.id);
    const order = i + 1;
    const pv = previewByKey.get(`${placeId}:${order}`);
    if (!Number.isInteger(placeId) || placeId <= 0 || ids.has(placeId) || !pv
      || !Number.isInteger(pv.duration) || pv.duration < 0) throw new Error('preview_mismatch');
    ids.add(placeId);
    const stayTime = pv.stayTime || parseStayMinutes(stop.time);
    if (!Number.isInteger(stayTime) || stayTime < 30 || stayTime > 90) throw new Error('invalid_stay_time');
    return { placeId, order, travelTime: pv.duration, stayTime };
  });
}
