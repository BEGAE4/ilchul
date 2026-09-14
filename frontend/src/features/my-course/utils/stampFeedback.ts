import { isAxiosError } from 'axios';

export type StampErrorKind = 'outOfRange' | 'alreadyStamped' | 'generic';

/**
 * 기억 스탬프 실패를 문구 종류로 나눈다 (문구는 STAMP_COPY.error[kind]).
 *   422 — 장소 150m 밖 ("현재 장소가 인증 범위 밖에 있습니다.")
 *   409 — 이미 기록한 곳 ("이미 인증된 장소입니다") — 호출부가 화면을 새로 불러온다
 * (2026-09-14 운영 확인). 이전에는 모든 실패가 '인증에 실패했어요' 하나라, 장소에서 멀어서인지 알 수 없었다.
 */
export function stampErrorKind(err: unknown): StampErrorKind {
  const status = isAxiosError(err) ? err.response?.status : undefined;
  if (status === 422) return 'outOfRange';
  if (status === 409) return 'alreadyStamped';
  return 'generic';
}
