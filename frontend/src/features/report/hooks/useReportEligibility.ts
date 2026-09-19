import { has } from '../utils/hiddenReportsStorage';
import type { CurrentUser, ReportTarget } from '../types';
import { isMine } from '@/shared/lib/auth/isMine';

interface UseReportEligibilityArgs {
  currentUser: CurrentUser;
  target: ReportTarget;
}

interface EligibilityResult {
  canShow: boolean;
  disabled: boolean;
  reason?: 'NOT_LOGGED_IN' | 'SELF_REPORT' | 'ALREADY_REPORTED';
}

// 내 숫자 id(userinfo.userId, 2026-09-18 추가)와 대상의 ownerUserId 로 판별한다. 둘 중 하나라도 없으면
// 예전처럼 닉네임으로 비교한다. 서버 측 403 self-report-forbidden 이 이중 안전망.
export function isSelfReport(user: CurrentUser, target: ReportTarget): boolean {
  return isMine(
    { isLoggedIn: user.isLoggedIn, userId: user.userId, name: user.name },
    { userId: target.ownerUserId, nickname: target.ownerId }
  );
}

export function useReportEligibility({ currentUser, target }: UseReportEligibilityArgs): EligibilityResult {
  if (!currentUser.isLoggedIn) {
    return { canShow: false, disabled: true, reason: 'NOT_LOGGED_IN' };
  }

  if (isSelfReport(currentUser, target)) {
    return { canShow: false, disabled: true, reason: 'SELF_REPORT' };
  }

  if (has(target)) {
    // 이미 신고한 콘텐츠: 노출되지만 disabled (§5-2 표)
    return { canShow: true, disabled: true, reason: 'ALREADY_REPORTED' };
  }

  return { canShow: true, disabled: false };
}
