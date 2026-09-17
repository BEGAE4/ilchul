import type { UserProfileErrorKind } from '../types/user-profile.types';

/**
 * 경로 파라미터 → 숫자 userId. 스웨거는 int32 라 양의 정수만 허용한다.
 * 예전 코드는 닉네임을 경로 키로 쓰고 있었으므로, 숫자가 아닌 값은 '없는 사용자'로 다룬다.
 */
export function parseUserId(raw: string | null | undefined): number | null {
  if (!raw) return null;
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

/**
 * HTTP 상태 → 프로필 화면 분기.
 * 404 회원 없음 / 410 탈퇴한 사용자 (스웨거 정의). 그 밖은 일반 오류로 다시 시도 버튼을 보여준다.
 */
export function classifyUserProfileError(status: number | null | undefined): UserProfileErrorKind {
  if (status === 404) return 'not-found';
  if (status === 410) return 'withdrawn';
  return 'error';
}

/**
 * 보고 있는 프로필이 나 자신인지. 로그인 정보(userinfo)에 숫자 userId 가 없어 닉네임으로 판별한다
 * (CourseViewPage.isMyPlan, report.isSelfReport 와 같은 방식). 본인이면 신고(⋮)를 숨긴다.
 */
export function isOwnProfile(
  me: { isLoggedIn: boolean; name: string | null | undefined },
  profileNickname: string | null | undefined
): boolean {
  return me.isLoggedIn && !!me.name && me.name === profileNickname;
}
