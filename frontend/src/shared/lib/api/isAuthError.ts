import { isAxiosError } from 'axios';

// 서버가 로그인을 요구한 응답(401/403)인지. 화면이 "네트워크 오류"와 구분해 로그인 안내를 띄우는 데 쓴다.
export function isAuthError(err: unknown): boolean {
  if (!isAxiosError(err)) return false;
  const status = err.response?.status;
  return status === 401 || status === 403;
}
