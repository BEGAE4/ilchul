// 신고(report) feature 공용 타입. discriminated union 채택 — target.type별 필수 컨텍스트가 다르다.

// 신고 대상 유형. P0: course/comment/user
export type ReportTargetType = 'course' | 'comment' | 'user';

// 사유 코드
export type ReportReasonCode =
  | 'SPAM_AD'
  | 'FAKE_INFO'
  | 'OBSCENE'
  | 'ABUSE'
  | 'COPYRIGHT'
  | 'IMPROPER_PROFILE'
  | 'IMPERSONATION'
  | 'PERSONAL_INFO_LEAK'
  | 'ETC';

export const REASON_LABELS: Record<ReportReasonCode, string> = {
  SPAM_AD: '스팸/광고',
  FAKE_INFO: '허위정보',
  OBSCENE: '음란성',
  ABUSE: '욕설/비방',
  COPYRIGHT: '저작권 침해',
  IMPROPER_PROFILE: '부적절한 닉네임/프로필',
  IMPERSONATION: '타인 사칭',
  PERSONAL_INFO_LEAK: '개인정보 노출',
  ETC: '기타(직접 입력)',
};

// Discriminated Union (Architect M-4)
// — 대상별로 필수 컨텍스트가 다르므로 type 단위로 강제
export type ReportTarget =
  | { type: 'course'; id: string; ownerId: string; title: string; contextUrl: string }
  | { type: 'comment'; id: string; ownerId: string; courseId: string; snippet: string; contextUrl: string }
  | { type: 'user'; id: string; ownerId: string; nickname: string; contextUrl: string };

export interface ReportPayload {
  target: ReportTarget;
  reasonCode: ReportReasonCode;
  detail?: string;
}

export type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED';

export interface ReportResponse {
  reportId?: string;
  status?: ReportStatus;
  alreadyReported?: boolean;
  autoBlinded?: boolean;
}

export interface CurrentUser {
  id: string;
  name: string;
  isLoggedIn: boolean;
}
