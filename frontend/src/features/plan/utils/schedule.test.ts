import { moveTripToDate, tripStartingNow, todayLocalDate } from './schedule';

describe('todayLocalDate', () => {
  it('주어진 시각의 로컬 날짜를 돌려준다 (UTC 로 밀리지 않음)', () => {
    expect(todayLocalDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});

describe('moveTripToDate', () => {
  it('날짜만 바꾸고 시각은 그대로 둔다', () => {
    expect(moveTripToDate('2026-09-13T10:00:00', '2026-09-13T12:30:00', '2026-09-20')).toEqual({
      tripStartDate: '2026-09-20 10:00',
      tripEndDate: '2026-09-20 12:30',
    });
  });

  it('1박 일정은 여행 일수를 유지한다 (월 경계 포함)', () => {
    expect(moveTripToDate('2026-09-13T18:00:00', '2026-09-14T11:00:00', '2026-09-30')).toEqual({
      tripStartDate: '2026-09-30 18:00',
      tripEndDate: '2026-10-01 11:00',
    });
  });

  it("공백 구분 형식('yyyy-MM-dd HH:mm')도 받는다", () => {
    expect(moveTripToDate('2026-09-13 10:00', '2026-09-13 10:22', '2026-09-11')).toEqual({
      tripStartDate: '2026-09-11 10:00',
      tripEndDate: '2026-09-11 10:22',
    });
  });
});

describe('tripStartingNow', () => {
  it('지금을 30분 단위로 내린 시각에 시작하고 소요시간 뒤에 끝난다', () => {
    expect(tripStartingNow(new Date(2026, 8, 11, 14, 47), 90)).toEqual({
      tripStartDate: '2026-09-11 14:30',
      tripEndDate: '2026-09-11 16:00',
    });
  });

  it('종료 시각은 30분 단위로 올림한다', () => {
    expect(tripStartingNow(new Date(2026, 8, 11, 9, 5), 22)).toEqual({
      tripStartDate: '2026-09-11 09:00',
      tripEndDate: '2026-09-11 09:30',
    });
  });

  it('늦은 밤이라 종료가 시작보다 앞서지 않으면 23:59 로 둔다', () => {
    expect(tripStartingNow(new Date(2026, 8, 11, 23, 40), 120)).toEqual({
      tripStartDate: '2026-09-11 23:30',
      tripEndDate: '2026-09-11 23:59',
    });
  });
});
