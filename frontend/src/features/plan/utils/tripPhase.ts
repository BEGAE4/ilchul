import { parseServerDate } from '@/shared/lib/format/serverDateTime';

// 나의 플랜의 여행 상태. unscheduled 는 담기·복제한 플랜처럼 여행 일시가 비어 있는 상태.
export type TripPhase = 'unscheduled' | 'before' | 'during' | 'after';

/**
 * 여행 상태를 날짜 단위로 판정한다. 시작일 00:00 ~ 종료일 23:59:59 가 '여행 중'.
 * 이전에는 시작 시각 ~ 종료 시각(분 단위)이라, 늦게 출발하거나 한곳에 오래 머물면
 * 기억 스탬프가 닫혔다. 일정 수정의 종료 시간 기본값(시작 + 소요시간)을 그대로 두면 22분만 열리기도 했다.
 * 날짜를 읽을 수 없으면 기록을 막지 않도록 'during' 으로 둔다.
 */
export function getTripPhase(
  tripStart?: string,
  tripEnd?: string,
  now: Date = new Date()
): TripPhase {
  if (!tripStart || !tripEnd) return 'unscheduled';
  const start = parseServerDate(tripStart);
  const end = parseServerDate(tripEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'during';
  const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const dayEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
  if (now < dayStart) return 'before';
  if (now > dayEnd) return 'after';
  return 'during';
}
