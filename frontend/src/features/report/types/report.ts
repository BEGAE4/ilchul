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

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: '검토 대기',
  REVIEWING: '검토 중',
  RESOLVED: '처리 완료',
  REJECTED: '반려',
};

export type ReportResolution = 'BLINDED' | 'WARNED' | 'BANNED' | 'NO_ACTION';

export const REPORT_RESOLUTION_LABELS: Record<ReportResolution, string> = {
  BLINDED: '콘텐츠 블라인드 처리',
  WARNED: '경고 조치',
  BANNED: '계정 정지',
  NO_ACTION: '조치 없음',
};

export interface ReportHistoryItem {
  status: ReportStatus;
  at: string;
  actor: 'system' | 'operator' | 'reporter';
}

export interface ReportDetail {
  reportId: string;
  target: ReportTarget;
  reasonCode: ReportReasonCode;
  detail: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  history: ReportHistoryItem[];
  resolution: ReportResolution | null;
}

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

// ── Sanction ──────────────────────────────────────────────

export type SanctionType =
  | 'WARNING'
  | 'CONTENT_BLINDED'
  | 'TEMP_BAN'
  | 'PERMANENT_BAN';

export const SANCTION_TYPE_LABELS: Record<SanctionType, string> = {
  WARNING: '경고',
  CONTENT_BLINDED: '콘텐츠 블라인드',
  TEMP_BAN: '일시 정지',
  PERMANENT_BAN: '영구 정지',
};

export type AppealStatus = 'NONE' | 'PENDING' | 'RESOLVED' | 'REJECTED';

export type SanctionTarget =
  | { type: 'course'; id: string; title: string; contextUrl: string }
  | { type: 'comment'; id: string; courseId: string; snippet: string; contextUrl: string }
  | { type: 'user'; id: string; nickname: string; contextUrl: string };

export interface Sanction {
  sanctionId: string;
  type: SanctionType;
  target: SanctionTarget;
  reasonCode: ReportReasonCode;
  message: string;
  issuedAt: string;
  expiresAt: string | null;
  isActive: boolean;
  relatedReportIds: string[];
  appealStatus: AppealStatus;
}

export interface MySanctionsResponse {
  data: Sanction[];
  totalCount: number;
  hasNext: boolean;
}
