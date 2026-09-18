// 일정 선택(Q3)의 계산 규칙. 화면은 "언제 출발 · 몇 시간"만 묻고 도착은 여기서 계산한다.
// 서버로 보내는 값(startDate/startTime/endDate/endTime)의 모양은 그대로다.

// 당일치기 기준 — '자고 오지 않는 일정'이므로 다음 날 새벽 귀가까지만 허용한다.
export const OVERNIGHT_END_LIMIT = '06:00';
export const MAX_TRIP_MINUTES = 20 * 60;
export const MIN_TRIP_MINUTES = 60;
export const STEP_MINUTES = 30;
// 이 시각 이후에 들어오면 기본값을 '오늘 지금'이 아니라 '내일 아침'으로 잡는다
const LATEST_DEFAULT_TODAY_START = '20:00';

const DAY_MINUTES = 24 * 60;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const pad = (n: number) => String(n).padStart(2, '0');

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function fromMinutes(min: number): string {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return toDateString(new Date(y, m - 1, d + days));
}

// 출발 + 길이 → 도착. 자정을 넘기면 종료일이 다음 날이 된다.
export function computeEnd(
  startDate: string,
  startTime: string,
  durationMin: number
): { endDate: string; endTime: string } {
  const total = toMinutes(startTime) + durationMin;
  return {
    endDate: addDays(startDate, Math.floor(total / DAY_MINUTES)),
    endTime: fromMinutes(total % DAY_MINUTES),
  };
}

// 저장된 시작·종료에서 길이(분)를 되살린다. 하나라도 비면 null.
export function durationOf(
  startDate: string | undefined,
  startTime: string | undefined,
  endDate: string | undefined,
  endTime: string | undefined
): number | null {
  if (!startDate || !startTime || !endDate || !endTime) return null;
  const start = new Date(`${startDate}T${startTime}`).getTime();
  const end = new Date(`${endDate}T${endTime}`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return Math.round((end - start) / 60_000);
}

// 이 시각에 출발하면 최대 몇 분까지 잡을 수 있나 — 20시간과 '다음 날 새벽 6시' 중 짧은 쪽
export function maxDurationFor(startTime: string): number {
  const untilLimit = DAY_MINUTES - toMinutes(startTime) + toMinutes(OVERNIGHT_END_LIMIT);
  return Math.min(MAX_TRIP_MINUTES, untilLimit);
}

export function clampDuration(durationMin: number, startTime: string): number {
  const stepped = Math.round(durationMin / STEP_MINUTES) * STEP_MINUTES;
  return Math.min(maxDurationFor(startTime), Math.max(MIN_TRIP_MINUTES, stepped));
}

// 지금 이후 가장 가까운 30분 칸. 오늘 안에 남은 칸이 없으면 null.
export function ceilToHalfHour(now: Date): string | null {
  const exact = now.getSeconds() === 0 && now.getMilliseconds() === 0;
  const minutes = now.getHours() * 60 + now.getMinutes() + (exact ? 0 : 1);
  const slot = Math.ceil(minutes / STEP_MINUTES) * STEP_MINUTES;
  return slot >= DAY_MINUTES ? null : fromMinutes(slot);
}

// 출발이 늦을수록 짧게 — 아침 8시간, 낮 5시간, 저녁 3시간
export function defaultDurationFor(startTime: string): number {
  const start = toMinutes(startTime);
  const base = start < 12 * 60 ? 480 : start < 17 * 60 ? 300 : 180;
  return clampDuration(base, startTime);
}

// 처음 들어왔을 때 문장에 채워 둘 값. 밤늦게 들어오면 내일 아침으로 잡는다.
export function defaultSchedule(now: Date): {
  startDate: string;
  startTime: string;
  durationMin: number;
} {
  const today = toDateString(now);
  const slot = ceilToHalfHour(now);
  if (slot && slot <= LATEST_DEFAULT_TODAY_START) {
    return { startDate: today, startTime: slot, durationMin: defaultDurationFor(slot) };
  }
  return { startDate: addDays(today, 1), startTime: '09:00', durationMin: 480 };
}

export function formatTimeLabel(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${h < 12 ? '오전' : '오후'} ${hour12}시${m ? ` ${m}분` : ''}`;
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}분`;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

// 문장 아래 결과 줄: "오후 5시쯤 돌아와요 · 총 8시간"
export function describeReturn(startDate: string, startTime: string, durationMin: number): string {
  const { endDate, endTime } = computeEnd(startDate, startTime, durationMin);
  const nextDay = endDate !== startDate ? '다음날 ' : '';
  return `${nextDay}${formatTimeLabel(endTime)}쯤 돌아와요 · 총 ${formatDuration(durationMin)}`;
}

// "주말 하루" 추천에 쓸 날짜. 오늘이 토요일이면 일요일, 일요일이면 다음 토요일.
export function weekendDayFor(todayStr: string): { date: string; label: string } {
  const [y, m, d] = todayStr.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  const offset = dow === 6 ? 1 : dow === 0 ? 6 : 6 - dow;
  const date = addDays(todayStr, offset);
  const [dy, dm, dd] = date.split('-').map(Number);
  return { date, label: `${WEEKDAYS[new Date(dy, dm - 1, dd).getDay()]}요일` };
}
