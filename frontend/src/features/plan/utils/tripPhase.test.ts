import { getTripPhase } from './tripPhase';

// 기기 로컬 시각으로 만든다 — getTripPhase 는 로컬 날짜 기준이다.
function at(y: number, mo: number, d: number, h = 0, mi = 0): Date {
  return new Date(y, mo - 1, d, h, mi);
}

describe('getTripPhase', () => {
  // QA 에서 실제로 저장된 짧은 일정 (소요시간만큼만 열리던 사례)
  const start = '2026-09-13T10:00:00';
  const end = '2026-09-13T10:22:00';

  it('일시가 하나라도 없으면 unscheduled', () => {
    expect(getTripPhase(undefined, end, at(2026, 9, 13, 10))).toBe('unscheduled');
    expect(getTripPhase(start, '', at(2026, 9, 13, 10))).toBe('unscheduled');
  });

  it('여행 전날은 before', () => {
    expect(getTripPhase(start, end, at(2026, 9, 12, 23, 59))).toBe('before');
  });

  it('여행 날이면 시작 시각 전이어도 during', () => {
    expect(getTripPhase(start, end, at(2026, 9, 13, 0, 0))).toBe('during');
    expect(getTripPhase(start, end, at(2026, 9, 13, 8, 0))).toBe('during');
  });

  it('종료 시각이 지나도 그날 안이면 during', () => {
    expect(getTripPhase(start, end, at(2026, 9, 13, 23, 59))).toBe('during');
  });

  it('자정이 지나도 다음 날 06:00 전까지는 during (야간 일정 여유)', () => {
    expect(getTripPhase('2026-09-13 18:00', '2026-09-13 23:30', at(2026, 9, 14, 0, 30))).toBe('during');
    expect(getTripPhase(start, end, at(2026, 9, 14, 5, 59))).toBe('during');
  });

  it('종료일 다음 날 06:00 이 되면 after (마감)', () => {
    expect(getTripPhase(start, end, at(2026, 9, 14, 6, 0))).toBe('after');
  });

  it("서버의 공백 구분 형식('yyyy-MM-dd HH:mm')도 읽는다", () => {
    expect(getTripPhase('2026-09-13 10:00', '2026-09-13 10:22', at(2026, 9, 13, 15))).toBe('during');
  });

  it('1박 일정은 종료일 다음 날 06:00 까지 during (월 경계 포함)', () => {
    expect(getTripPhase('2026-09-29T18:00:00', '2026-09-30T11:00:00', at(2026, 9, 30, 20))).toBe('during');
    expect(getTripPhase('2026-09-29T18:00:00', '2026-09-30T11:00:00', at(2026, 10, 1, 5, 59))).toBe('during');
    expect(getTripPhase('2026-09-29T18:00:00', '2026-09-30T11:00:00', at(2026, 10, 1, 6, 0))).toBe('after');
  });

  it('날짜를 읽을 수 없으면 기록을 막지 않도록 during', () => {
    expect(getTripPhase('invalid', 'invalid', at(2026, 9, 13, 10))).toBe('during');
  });
});
