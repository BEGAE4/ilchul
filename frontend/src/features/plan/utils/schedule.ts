// 플랜 일정(날짜·시간) 선택 공용 유틸.
// 나의 플랜 복제 모달과 공개 플랜 '일정 담기' 모달이 같은 목록·규칙을 쓴다.

import { toServerDateTime } from '@/shared/lib/format/serverDateTime';

export interface HalfHourOption {
  /** 'HH:mm' — 서버 전송·비교용 */
  value: string;
  /** '오전 9시 30분' — 화면 표시용 */
  label: string;
}

/** 'HH:mm' → 자정 기준 분. 시작/종료 시간 비교에 쓴다. */
export function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** 00:00 ~ 23:30 을 30분 간격으로 */
export const HALF_HOURS: HalfHourOption[] = (() => {
  const out: HalfHourOption[] = [];
  for (let i = 0; i < 24; i++) {
    for (const m of [0, 30]) {
      const h = i.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      const period = i < 12 ? '오전' : '오후';
      const dispH = i === 0 ? 12 : i <= 12 ? i : i - 12;
      out.push({
        value: `${h}:${mm}`,
        label: `${period} ${dispH}시${m === 30 ? ' 30분' : ''}`,
      });
    }
  }
  return out;
})();

/** 'yyyy-MM-dd' (로컬 기준 — toISOString 은 UTC 라 밤에 하루 밀린다). 기본은 지금. */
export function todayLocalDate(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * 시작 시간과 소요 시간(분)으로 종료 시간을 만든다.
 * 자정을 넘기면 23:30 으로 자른다(당일치기 서비스라 날짜를 넘기지 않는다).
 */
export function addMinutesToTime(start: string, minutes: number): string {
  const total = timeToMin(start) + Math.max(0, minutes);
  const capped = Math.min(total, 23 * 60 + 30);
  const h = Math.floor(capped / 60);
  const m = capped % 60;
  // 30분 단위 목록에 맞춰 올림
  const rounded = m === 0 || m === 30 ? m : m < 30 ? 30 : 0;
  const hh = rounded === 0 && m > 30 ? Math.min(h + 1, 23) : h;
  return `${String(hh).padStart(2, '0')}:${String(rounded).padStart(2, '0')}`;
}

/** 서버로 보내는 여행 일시 쌍 — 'yyyy-MM-dd HH:mm' (toServerDateTime 형식) */
export interface TripRange {
  tripStartDate: string;
  tripEndDate: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** 'yyyy-MM-dd' 두 날짜 사이의 일수 (b - a). 서머타임 영향이 없도록 UTC 로 계산한다. */
function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / DAY_MS);
}

/** 'yyyy-MM-dd' + n일 */
function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

/**
 * 기존 여행 일정의 날짜만 targetDate 로 옮긴다. 시각과 여행 일수(1박 등)는 그대로 둔다.
 * 서버 응답('yyyy-MM-ddTHH:mm:ss')과 요청 형식('yyyy-MM-dd HH:mm') 모두 앞 10자가 날짜, 11~16자가 시각이다.
 */
export function moveTripToDate(tripStart: string, tripEnd: string, targetDate: string): TripRange {
  const nights = daysBetween(tripStart.slice(0, 10), tripEnd.slice(0, 10));
  return {
    tripStartDate: toServerDateTime(targetDate, tripStart.slice(11, 16)),
    tripEndDate: toServerDateTime(addDays(targetDate, nights), tripEnd.slice(11, 16)),
  };
}

/**
 * 일정이 없는 플랜을 '지금 시작하는 오늘 여행'으로 만든다.
 * 시작은 지금을 30분 단위로 내린다(일정 수정 시트의 선택지와 맞춤). 종료는 소요시간 뒤.
 * 늦은 밤이라 종료가 시작보다 뒤가 아니면 23:59 로 둔다.
 */
export function tripStartingNow(now: Date, requiredMinutes: number): TripRange {
  const date = todayLocalDate(now);
  const start = `${String(now.getHours()).padStart(2, '0')}:${now.getMinutes() < 30 ? '00' : '30'}`;
  const end = addMinutesToTime(start, requiredMinutes);
  return {
    tripStartDate: toServerDateTime(date, start),
    tripEndDate: toServerDateTime(date, timeToMin(end) > timeToMin(start) ? end : '23:59'),
  };
}
