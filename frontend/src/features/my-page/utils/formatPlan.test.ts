import { formatIsoDate, formatRequiredTime, formatTripPeriod } from './formatPlan';

describe('formatIsoDate', () => {
  it("서버 형식 'yyyy-MM-dd HH:mm' 을 ko-KR 날짜로 찍는다", () => {
    expect(formatIsoDate('2026-09-12 10:30')).toBe('2026. 09. 12.');
  });

  it('ISO 문자열도 같은 형식으로 찍는다', () => {
    expect(formatIsoDate('2026-08-30T09:00:00')).toBe('2026. 08. 30.');
  });

  it('없으면 생성일 미정, 읽을 수 없으면 원문 그대로', () => {
    expect(formatIsoDate(null)).toBe('생성일 미정');
    expect(formatIsoDate(undefined)).toBe('생성일 미정');
    expect(formatIsoDate('img1')).toBe('img1');
  });
});

describe('formatTripPeriod', () => {
  it('시작·종료가 다르면 범위로', () => {
    expect(formatTripPeriod('2026-09-12 09:00', '2026-09-13 18:00')).toBe(
      '2026. 09. 12. ~ 2026. 09. 13.'
    );
  });

  it('같은 날이면 한 번만', () => {
    expect(formatTripPeriod('2026-09-12 09:00', '2026-09-12 18:00')).toBe('2026. 09. 12.');
  });

  it('종료만 없으면 시작일만, 시작이 없으면 일정 미정', () => {
    expect(formatTripPeriod('2026-09-12 09:00', null)).toBe('2026. 09. 12.');
    expect(formatTripPeriod(null, '2026-09-12 09:00')).toBe('일정 미정');
  });
});

describe('formatRequiredTime', () => {
  it('시간과 분을 나눠 찍는다', () => {
    expect(formatRequiredTime(260)).toBe('4시간 20분');
    expect(formatRequiredTime(300)).toBe('5시간');
    expect(formatRequiredTime(45)).toBe('45분');
  });

  it('0 이하·없음은 소요 시간 미정', () => {
    expect(formatRequiredTime(0)).toBe('소요 시간 미정');
    expect(formatRequiredTime(-5)).toBe('소요 시간 미정');
    expect(formatRequiredTime(null)).toBe('소요 시간 미정');
  });
});
