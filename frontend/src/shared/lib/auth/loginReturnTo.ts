// 로그인 유도 모달에서 로그인으로 넘어갈 때 돌아올 경로를 기억한다.
// 카카오 OAuth 는 서버 리다이렉트로 /login/success 에 떨어지므로 쿼리로 넘길 수 없어 세션에 둔다.
const KEY = 'ilchul:login-return-to';

export function saveLoginReturnTo(path: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  try {
    if (path && path.startsWith('/') && !path.startsWith('/login')) {
      sessionStorage.setItem(KEY, path);
    } else {
      sessionStorage.removeItem(KEY);
    }
  } catch {
    /* 세션 스토리지 사용 불가 환경은 무시 */
  }
}

// 읽으면서 지운다 — 한 번의 로그인에만 쓰인다.
export function consumeLoginReturnTo(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return value && value.startsWith('/') && !value.startsWith('/login') ? value : null;
  } catch {
    return null;
  }
}
