import { isAxiosError } from 'axios';
import { isImageTooLarge } from '@/shared/lib/image';

export type StampErrorKind =
  | 'outOfRange'
  | 'alreadyStamped'
  | 'generic'
  | 'inaccurateLocation'
  | 'tooLarge'
  | 'timeout';

/** 서버가 스탬프를 받아주는 반경 (PlanPlaceServiceImpl.stampPlanPlace 의 `distance > 150`) */
export const STAMP_RADIUS_M = 150;

/**
 * 기억 스탬프 실패를 문구 종류로 나눈다 (문구는 STAMP_COPY.error[kind]).
 *   422 — 장소 150m 밖 ("현재 장소가 인증 범위 밖에 있습니다.")
 *   409 — 이미 기록한 곳 ("이미 인증된 장소입니다") — 호출부가 화면을 새로 불러온다
 * (2026-09-14 운영 확인). 이전에는 모든 실패가 '인증에 실패했어요' 하나라, 장소에서 멀어서인지 알 수 없었다.
 *
 * accuracyM 은 브라우저가 준 위치 오차 반경(미터, `coords.accuracy`). 이 값이 판정 반경보다 크면
 * 좌표가 150m 안팎을 구분할 만큼 정밀하지 않다 — 실제로 장소에 서 있어도 422 가 날 수 있다.
 * 이때 '장소에서 떨어져 있다'고 말하면 사실이 아니므로 위치 정밀도 문제로 안내한다.
 */
export function stampErrorKind(err: unknown, accuracyM?: number): StampErrorKind {
  const status = isAxiosError(err) ? err.response?.status : undefined;
  if (status === 422) {
    return accuracyM !== undefined && accuracyM > STAMP_RADIUS_M ? 'inaccurateLocation' : 'outOfRange';
  }
  if (status === 409) return 'alreadyStamped';
  // 사진 용량 초과(413). 위치 문제로 안내하면 계속 같은 사진으로 실패한다
  if (isImageTooLarge(err)) return 'tooLarge';
  // 업로드 제한 시간 초과 (axios timeout → ECONNABORTED / ETIMEDOUT). 회선이 약한 여행지에서 잦다
  if (isAxiosError(err) && (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT')) return 'timeout';
  return 'generic';
}

/** 사용자가 '취소'를 눌러 요청을 끊은 경우 — 실패가 아니므로 안내를 띄우지 않는다 */
export function isStampCanceled(err: unknown): boolean {
  return isAxiosError(err) && err.code === 'ERR_CANCELED';
}

interface LngLat {
  /** 경도 */
  x: number;
  /** 위도 */
  y: number;
}

/** 두 좌표 사이 거리(미터). 하버사인 — 150m~수 km 범위에서 오차는 무시할 수준이다 */
export function distanceMeters(a: LngLat, b: LngLat): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.y - a.y);
  const dLng = toRad(b.x - a.x);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.y)) * Math.cos(toRad(b.y)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** '약 320m' / '약 1.2km' / '약 15km'. 1km 미만은 10m 단위, 10km 미만은 소수 한 자리 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `약 ${Math.max(10, Math.round(meters / 10) * 10)}m`;
  const km = meters / 1000;
  return km < 10 ? `약 ${km.toFixed(1)}km` : `약 ${Math.round(km)}km`;
}

/**
 * 범위 밖(422) 안내 제목. 예전에는 몇 km 밖에서도 "조금 떨어져 있어요"라고 말했다.
 * 장소 좌표를 알면 실제 거리를 말하고, 모르면 거리를 단정하지 않는 문구를 쓴다.
 */
export function outOfRangeTitle(distanceM?: number | null): string {
  if (distanceM === undefined || distanceM === null || !Number.isFinite(distanceM)) {
    return '장소 근처가 아니에요.';
  }
  return `장소에서 ${formatDistance(distanceM)} 떨어져 있어요.`;
}
