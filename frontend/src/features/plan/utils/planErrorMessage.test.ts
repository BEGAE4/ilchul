import { toPlanErrorMessage } from './planErrorMessage';

// axios 의 isAxiosError 는 isAxiosError: true 인 객체를 AxiosError 로 본다 (stampFeedback.test.ts 와 같은 방식)
function axiosErrorWithStatus(status: number) {
  return { isAxiosError: true, response: { status } };
}

describe('toPlanErrorMessage', () => {
  it('404 는 존재하지 않는 플랜 (P-16)', () => {
    expect(toPlanErrorMessage(axiosErrorWithStatus(404))).toEqual({
      kind: 'not_found',
      message: '존재하지 않거나 삭제된 플랜이에요.',
    });
  });

  it('400 도 존재하지 않는 플랜으로 본다', () => {
    expect(toPlanErrorMessage(axiosErrorWithStatus(400)).kind).toBe('not_found');
  });

  it('401·403 은 로그인 필요', () => {
    expect(toPlanErrorMessage(axiosErrorWithStatus(401)).kind).toBe('auth');
    expect(toPlanErrorMessage(axiosErrorWithStatus(403)).message).toBe('로그인이 필요한 플랜이에요.');
  });

  it('500 이상은 일시 오류', () => {
    expect(toPlanErrorMessage(axiosErrorWithStatus(500))).toEqual({
      kind: 'server',
      message: '일시적인 오류로 플랜을 불러오지 못했어요.',
    });
  });

  it('axios 오류가 아니거나 응답이 없으면 공통 문구', () => {
    expect(toPlanErrorMessage(new Error('network'))).toEqual({
      kind: 'unknown',
      message: '플랜 정보를 불러오지 못했어요.',
    });
    expect(toPlanErrorMessage({ isAxiosError: true, response: undefined }).kind).toBe('unknown');
    expect(toPlanErrorMessage(undefined).kind).toBe('unknown');
  });
});
