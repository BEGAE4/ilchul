import { has } from '../utils/hiddenReportsStorage';
import type { CurrentUser, ReportTarget } from '../types';

interface UseReportEligibilityArgs {
  currentUser: CurrentUser;
  target: ReportTarget;
}

interface EligibilityResult {
  canShow: boolean;
  disabled: boolean;
  reason?: 'NOT_LOGGED_IN' | 'SELF_REPORT' | 'ALREADY_REPORTED';
}

// Q1 결정: 닉네임 best-effort 매칭. 백엔드 안정 식별자 도입 시 이 함수 1개만 교체.
// A7: 동명이인 우회 가능성 인지 — 서버 측 403 self-report-forbidden이 이중 안전망.
export function isSelfReport(user: CurrentUser, target: ReportTarget): boolean {
  // TODO(auth): user.id가 안정 식별자가 되면 user.id === target.ownerId로 교체 (백엔드 안정 ID 도입 후)
  return user.isLoggedIn && user.name === target.ownerId;
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
