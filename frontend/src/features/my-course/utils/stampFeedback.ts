import { isAxiosError } from 'axios';

export type StampErrorKind = 'outOfRange' | 'alreadyStamped' | 'generic' | 'inaccurateLocation';

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
  return 'generic';
}
