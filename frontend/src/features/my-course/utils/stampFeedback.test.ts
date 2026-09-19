import {
  distanceMeters,
  formatDistance,
  isStampCanceled,
  outOfRangeTitle,
  stampErrorKind,
} from './stampFeedback';

// axios 의 isAxiosError 는 isAxiosError: true 인 객체를 AxiosError 로 본다
function axiosError(status: number) {
  return { isAxiosError: true, response: { status } };
}

describe('stampErrorKind', () => {
  it('422(인증 범위 밖)는 outOfRange', () => {
    expect(stampErrorKind(axiosError(422))).toBe('outOfRange');
  });

  it('409(이미 인증된 장소)는 alreadyStamped', () => {
    expect(stampErrorKind(axiosError(409))).toBe('alreadyStamped');
  });

  it('413(사진 용량 초과)은 tooLarge — 위치 문제로 오해하지 않게 따로 안내한다', () => {
    expect(stampErrorKind(axiosError(413))).toBe('tooLarge');
    expect(stampErrorKind(new Error('image_too_large'))).toBe('tooLarge');
  });

  it('그 외 상태·네트워크 오류는 generic', () => {
    expect(stampErrorKind(axiosError(500))).toBe('generic');
    expect(stampErrorKind(new Error('Network Error'))).toBe('generic');
    expect(stampErrorKind(undefined)).toBe('generic');
  });

  it('422 라도 위치 오차가 판정 반경보다 크면 inaccurateLocation', () => {
    // 오차 반경이 150m 를 넘으면 좌표가 150m 판정을 가릴 수 없다.
    // '떨어져 있다'가 아니라 '위치를 믿을 수 없다'가 사실에 맞는 안내다.
    expect(stampErrorKind(axiosError(422), 151)).toBe('inaccurateLocation');
    expect(stampErrorKind(axiosError(422), 2000)).toBe('inaccurateLocation');
  });

  it('422 에 오차가 판정 반경 이내거나 알 수 없으면 outOfRange 를 유지', () => {
    expect(stampErrorKind(axiosError(422), 150)).toBe('outOfRange');
    expect(stampErrorKind(axiosError(422), 20)).toBe('outOfRange');
    expect(stampErrorKind(axiosError(422), undefined)).toBe('outOfRange');
  });

  it('오차가 커도 422 가 아니면 분류가 바뀌지 않는다', () => {
    expect(stampErrorKind(axiosError(409), 5000)).toBe('alreadyStamped');
    expect(stampErrorKind(axiosError(500), 5000)).toBe('generic');
  });
});

describe('stampErrorKind — 시간 초과·취소', () => {
  it('axios 제한 시간 초과는 timeout', () => {
    expect(stampErrorKind({ isAxiosError: true, code: 'ECONNABORTED' })).toBe('timeout');
    expect(stampErrorKind({ isAxiosError: true, code: 'ETIMEDOUT' })).toBe('timeout');
  });

  it('사용자가 취소한 요청은 isStampCanceled', () => {
    expect(isStampCanceled({ isAxiosError: true, code: 'ERR_CANCELED' })).toBe(true);
    expect(isStampCanceled({ isAxiosError: true, code: 'ECONNABORTED' })).toBe(false);
    expect(isStampCanceled(new Error('x'))).toBe(false);
  });
});

describe('distanceMeters', () => {
  it('같은 좌표는 0', () => {
    expect(distanceMeters({ x: 126.97, y: 37.55 }, { x: 126.97, y: 37.55 })).toBe(0);
  });

  it('위도 0.001도는 약 111m', () => {
    const d = distanceMeters({ x: 126.97, y: 37.55 }, { x: 126.97, y: 37.551 });
    expect(d).toBeGreaterThan(108);
    expect(d).toBeLessThan(114);
  });

  it('서울시청 ↔ 부산시청은 약 320km', () => {
    const d = distanceMeters({ x: 126.978, y: 37.5665 }, { x: 129.0756, y: 35.1796 });
    expect(d / 1000).toBeGreaterThan(315);
    expect(d / 1000).toBeLessThan(335);
  });
});

describe('formatDistance · outOfRangeTitle', () => {
  it('1km 미만은 10m 단위, 그 이상은 km', () => {
    expect(formatDistance(163)).toBe('약 160m');
    expect(formatDistance(4)).toBe('약 10m');
    expect(formatDistance(1234)).toBe('약 1.2km');
    expect(formatDistance(15400)).toBe('약 15km');
  });

  it('거리를 알면 실제 거리를 말한다 — 몇 km 밖을 "조금"이라고 하지 않는다', () => {
    expect(outOfRangeTitle(2300)).toBe('장소에서 약 2.3km 떨어져 있어요.');
    expect(outOfRangeTitle(180)).toBe('장소에서 약 180m 떨어져 있어요.');
  });

  it('거리를 모르면 단정하지 않는 문구', () => {
    expect(outOfRangeTitle(undefined)).toBe('장소 근처가 아니에요.');
    expect(outOfRangeTitle(null)).toBe('장소 근처가 아니에요.');
    expect(outOfRangeTitle(NaN)).toBe('장소 근처가 아니에요.');
  });
});
