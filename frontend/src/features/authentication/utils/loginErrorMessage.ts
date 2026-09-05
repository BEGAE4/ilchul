const ERROR_MESSAGES: Record<string, string> = {
  kakao_cancelled: '카카오 로그인이 취소되었습니다. 다시 시도해 주세요.',
  kakao_failed: '카카오 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  google_cancelled: '구글 로그인이 취소되었습니다. 다시 시도해 주세요.',
  google_failed: '구글 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  naver_cancelled: '네이버 로그인이 취소되었습니다. 다시 시도해 주세요.',
  naver_failed: '네이버 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
};

const DEFAULT_MESSAGE = '로그인 중 오류가 발생했습니다. 다시 시도해 주세요.';

/**
 * `/login?error=...` 의 값을 사용자 문구로 바꾼다.
 * - 쿼리가 없으면 null (문구 미표시)
 * - 값이 비어 있어도(`/login?error`) 공통 문구를 보여준다 — 운영 백엔드는
 *   소셜 로그인 취소·실패 시 값 없는 `?error` 로 리다이렉트한다 (QA A #4)
 * - 알 수 없는 값은 공통 문구
 */
export function resolveLoginErrorMessage(
  hasErrorParam: boolean,
  errorValue: string | null
): string | null {
  if (!hasErrorParam) return null;
  const key = (errorValue ?? '').trim();
  return ERROR_MESSAGES[key] ?? DEFAULT_MESSAGE;
}
