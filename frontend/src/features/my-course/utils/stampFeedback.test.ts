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

  it('그 외 상태·네트워크 오류는 generic', () => {
    expect(stampErrorKind(axiosError(500))).toBe('generic');
    expect(stampErrorKind(new Error('Network Error'))).toBe('generic');
    expect(stampErrorKind(undefined)).toBe('generic');
  });
});
