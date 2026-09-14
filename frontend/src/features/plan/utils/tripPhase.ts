import { parseServerDate } from '@/shared/lib/format/serverDateTime';

// 나의 플랜의 여행 상태. unscheduled 는 담기·복제한 플랜처럼 여행 일시가 비어 있는 상태.
export type TripPhase = 'unscheduled' | 'before' | 'during' | 'after';

// 마감 = 종료일 다음 날 06:00. 코스 생성의 당일치기 기준(다음 날 새벽 6시 귀가까지, OVERNIGHT_END_LIMIT)과 맞춘다.
// 야간 일정(예: 18:00~23:30)이 자정에 바로 닫혀 마지막 장소 기록을 놓치지 않게 한다.
export const TRIP_CLOSE_HOUR_NEXT_DAY = 6;

/**
 * 여행 상태를 날짜 단위로 판정한다. 시작일 00:00 ~ 마감(종료일 다음 날 06:00) 전까지가 '여행 중'.
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
  const closeAt = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1, TRIP_CLOSE_HOUR_NEXT_DAY);
  if (now < dayStart) return 'before';
  if (now >= closeAt) return 'after';
  return 'during';
}
