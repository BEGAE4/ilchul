import { stampErrorKind } from './stampFeedback';

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
