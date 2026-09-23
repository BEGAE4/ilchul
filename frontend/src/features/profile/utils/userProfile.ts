import { isMine } from '@/shared/lib/auth/isMine';
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
  // 비로그인(또는 권한 없음) — 화면이 로그인 안내를 띄운다
  if (status === 401 || status === 403) return 'auth';
  return 'error';
}

/**
 * 보고 있는 프로필이 나 자신인지. 경로의 숫자 userId 와 내 userId(userinfo)로 판별하고,
 * 내 id 를 아직 모르면 닉네임으로 폴백한다 (shared/lib/auth/isMine). 본인이면 신고(⋮)를 숨긴다.
 */
export function isOwnProfile(
  me: { isLoggedIn: boolean; userId?: number | null; name: string | null | undefined },
  profileNickname: string | null | undefined,
  profileUserId?: number | null
): boolean {
  return isMine(
    { isLoggedIn: me.isLoggedIn, userId: me.userId, name: me.name },
    { userId: profileUserId, nickname: profileNickname }
  );
}
