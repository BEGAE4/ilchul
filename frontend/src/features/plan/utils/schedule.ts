// 플랜 일정(날짜·시간) 선택 공용 유틸.
// 나의 플랜 복제 모달과 공개 플랜 '일정 담기' 모달이 같은 목록·규칙을 쓴다.

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

/** 오늘 날짜 'yyyy-MM-dd' (로컬 기준 — toISOString 은 UTC 라 밤에 하루 밀린다) */
export function todayLocalDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
