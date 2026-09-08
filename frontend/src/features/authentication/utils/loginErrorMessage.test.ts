import { resolveLoginErrorMessage } from './loginErrorMessage';

describe('resolveLoginErrorMessage', () => {
  it('error 쿼리가 없으면 문구를 표시하지 않는다', () => {
    expect(resolveLoginErrorMessage(false, null)).toBeNull();
  });

  it('알려진 키는 제공자별 문구를 돌려준다', () => {
    expect(resolveLoginErrorMessage(true, 'kakao_cancelled')).toContain('카카오 로그인이 취소');
    expect(resolveLoginErrorMessage(true, 'naver_failed')).toContain('네이버 로그인 중 오류');
  });

  it('값 없는 ?error 도 공통 문구를 보여준다 (백엔드 실패 리다이렉트 형식, QA A #4)', () => {
    expect(resolveLoginErrorMessage(true, '')).toContain('로그인 중 오류');
    expect(resolveLoginErrorMessage(true, null)).toContain('로그인 중 오류');
  });

  it('알 수 없는 값은 공통 문구', () => {
    expect(resolveLoginErrorMessage(true, 'something_else')).toContain('로그인 중 오류');
  });
});
