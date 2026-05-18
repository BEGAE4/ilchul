import type { ReportTargetType, ReportReasonCode } from '../types';

export const REASONS_BY_TARGET: Record<ReportTargetType, ReportReasonCode[]> = {
  course: ['SPAM_AD', 'FAKE_INFO', 'OBSCENE', 'ABUSE', 'COPYRIGHT', 'ETC'],
  comment: ['ABUSE', 'OBSCENE', 'SPAM_AD', 'PERSONAL_INFO_LEAK', 'ETC'], // Q2 임시안
  user: ['COPYRIGHT', 'IMPROPER_PROFILE', 'IMPERSONATION', 'ETC'],
};
