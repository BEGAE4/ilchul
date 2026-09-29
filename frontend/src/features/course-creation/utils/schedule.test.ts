import {
  ceilToHalfHour,
  clampDuration,
  computeEnd,
  defaultDurationFor,
  defaultSchedule,
  describeReturn,
  durationOf,
  formatDuration,
  formatTimeLabel,
  maxDurationFor,
  weekendDayFor,
} from './schedule';

const at = (y: number, mo: number, d: number, h: number, mi: number, s = 0) =>
  new Date(y, mo - 1, d, h, mi, s);

describe('computeEnd', () => {
  it('같은 날 안에서 끝나면 날짜가 그대로다', () => {
    expect(computeEnd('2026-09-19', '09:00', 480)).toEqual({ endDate: '2026-09-19', endTime: '17:00' });
  });

  it('자정을 넘기면 종료일이 다음 날이 된다', () => {
    expect(computeEnd('2026-09-18', '19:30', 300)).toEqual({ endDate: '2026-09-19', endTime: '00:30' });
  });

  it('월말에서 넘어가도 날짜가 맞다', () => {
    expect(computeEnd('2026-09-30', '22:00', 240)).toEqual({ endDate: '2026-10-01', endTime: '02:00' });
  });
});

describe('durationOf', () => {
  it('시작·종료에서 분 단위 길이를 구한다', () => {
    expect(durationOf('2026-09-18', '19:30', '2026-09-19', '00:30')).toBe(300);
  });

  it('값이 비어 있으면 null', () => {
    expect(durationOf('2026-09-18', '', '2026-09-18', '10:00')).toBeNull();
    expect(durationOf(undefined, '09:00', undefined, '10:00')).toBeNull();
  });
});

describe('maxDurationFor', () => {
  it('아침 출발은 최대 20시간에 걸린다', () => {
    expect(maxDurationFor('09:00')).toBe(20 * 60);
  });

  it('저녁 출발은 다음 날 새벽 6시까지만', () => {
    expect(maxDurationFor('19:30')).toBe(10 * 60 + 30);
    expect(maxDurationFor('23:30')).toBe(6 * 60 + 30);
  });
});

describe('clampDuration', () => {
  it('30분 단위로 맞추고 1시간 ~ 출발 시각별 최대 사이로 자른다', () => {
    expect(clampDuration(20, '09:00')).toBe(60);
    expect(clampDuration(490, '09:00')).toBe(480);
    expect(clampDuration(900, '19:30')).toBe(630);
  });
});

describe('ceilToHalfHour', () => {
  it('정각·30분은 그대로, 그 외는 다음 30분 칸으로 올린다', () => {
    expect(ceilToHalfHour(at(2026, 9, 18, 14, 0))).toBe('14:00');
    expect(ceilToHalfHour(at(2026, 9, 18, 14, 1))).toBe('14:30');
    expect(ceilToHalfHour(at(2026, 9, 18, 14, 30, 5))).toBe('15:00');
    expect(ceilToHalfHour(at(2026, 9, 18, 14, 31))).toBe('15:00');
  });

  it('오늘 안에 남은 칸이 없으면 null', () => {
    expect(ceilToHalfHour(at(2026, 9, 18, 23, 31))).toBeNull();
  });
});

describe('defaultDurationFor', () => {
  it('출발이 늦을수록 짧게 잡는다', () => {
    expect(defaultDurationFor('09:00')).toBe(480);
    expect(defaultDurationFor('14:30')).toBe(300);
    expect(defaultDurationFor('19:30')).toBe(180);
  });
});

describe('defaultSchedule', () => {
  it('낮에는 오늘 · 지금(30분 올림)부터', () => {
    expect(defaultSchedule(at(2026, 9, 18, 14, 10))).toEqual({
      startDate: '2026-09-18',
      startTime: '14:30',
      durationMin: 300,
    });
  });

  it('밤 8시를 넘기면 내일 오전 9시 · 8시간', () => {
    expect(defaultSchedule(at(2026, 9, 18, 20, 40))).toEqual({
      startDate: '2026-09-19',
      startTime: '09:00',
      durationMin: 480,
    });
  });
});

describe('formatTimeLabel / formatDuration', () => {
  it('오전·오후 12시간제로 읽는다', () => {
    expect(formatTimeLabel('09:00')).toBe('오전 9시');
    expect(formatTimeLabel('13:30')).toBe('오후 1시 30분');
    expect(formatTimeLabel('00:30')).toBe('오전 12시 30분');
    expect(formatTimeLabel('12:00')).toBe('오후 12시');
  });

  it('길이는 시간·분으로', () => {
    expect(formatDuration(480)).toBe('8시간');
    expect(formatDuration(270)).toBe('4시간 30분');
  });
});

describe('describeReturn', () => {
  it('같은 날', () => {
    expect(describeReturn('2026-09-19', '09:00', 480)).toBe('오후 5시쯤 돌아와요 · 총 8시간');
  });

  it('자정을 넘기면 "다음날"을 붙인다', () => {
    expect(describeReturn('2026-09-18', '19:30', 300)).toBe(
      '다음날 오전 12시 30분쯤 돌아와요 · 총 5시간'
    );
  });
});

describe('weekendDayFor', () => {
  it('평일이면 다가오는 토요일', () => {
    expect(weekendDayFor('2026-09-18')).toEqual({ date: '2026-09-19', label: '토요일' });
  });

  it('토요일이면 일요일, 일요일이면 다음 토요일', () => {
    expect(weekendDayFor('2026-09-19')).toEqual({ date: '2026-09-20', label: '일요일' });
    expect(weekendDayFor('2026-09-20')).toEqual({ date: '2026-09-26', label: '토요일' });
  });
});
