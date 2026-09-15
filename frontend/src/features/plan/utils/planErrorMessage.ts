import { isAxiosError } from 'axios';

// 플랜 상세 조회 실패를 화면이 구분해 다룰 수 있게 상태코드별로 나눈다 (P-16).
// 백엔드는 2026-09-14 부터 없는 플랜에 404 를 준다. 그 전에는 전부 500 이라 구분이 불가능했다.
export type PlanErrorKind = 'not_found' | 'auth' | 'server' | 'unknown';

export function toPlanErrorMessage(err: unknown): { kind: PlanErrorKind; message: string } {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      return { kind: 'auth', message: '로그인이 필요한 플랜이에요.' };
    }
    if (status === 404 || status === 400) {
      return { kind: 'not_found', message: '존재하지 않거나 삭제된 플랜이에요.' };
    }
    if (status && status >= 500) {
      return { kind: 'server', message: '일시적인 오류로 플랜을 불러오지 못했어요.' };
    }
  }
  return { kind: 'unknown', message: '플랜 정보를 불러오지 못했어요.' };
}
