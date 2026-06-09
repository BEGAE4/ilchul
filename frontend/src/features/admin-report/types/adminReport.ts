import type {
  ReportReasonCode,
  ReportStatus,
  ReportTarget,
  ReportTargetType,
} from '@/features/report/types/report';

export type SanctionType =
  | 'WARNING'
  | 'CONTENT_BLINDED'
  | 'TEMP_BAN'
  | 'PERMANENT_BAN';

export type ReportResolution = 'BLINDED' | 'WARNED' | 'BANNED' | 'NO_ACTION';

export interface AdminReportListItem {
  reportId: string;
  target: ReportTarget;
  reasonCode: ReportReasonCode;
  status: ReportStatus;
  reporterId: string;
  reporterNickname: string;
  createdAt: string;
  updatedAt: string;
  assignedOperator: string | null;
  reportCount: number;
  autoBlinded: boolean;
}

export interface HistoryEntry {
  status: ReportStatus;
  at: string;
  actor: string;
  note?: string;
}

export interface RelatedReportEntry {
  reportId: string;
  reasonCode: ReportReasonCode;
  reporterNickname: string;
  createdAt: string;
}

export interface AdminReportDetail extends AdminReportListItem {
  detail: string | null;
  history: HistoryEntry[];
  relatedReports: RelatedReportEntry[];
  resolution: ReportResolution | null;
}

export interface IssueSanctionPayload {
  reportId: string;
  type: SanctionType;
  durationDays?: number;
  message: string;
  resolution: ReportResolution;
}

export interface IssueSanctionResponse {
  sanctionId: string;
  report: AdminReportDetail;
}

export type AdminReportSort =
  | 'createdAt:desc'
  | 'createdAt:asc'
  | 'reportCount:desc';

export interface AdminReportListParams {
  status?: ReportStatus | 'all';
  targetType?: ReportTargetType | 'all';
  reasonCode?: ReportReasonCode | 'all';
  q?: string;
  page?: number;
  size?: number;
  sort?: AdminReportSort;
  autoBlindedOnly?: boolean;
}

export interface AdminReportListResponse {
  data: AdminReportListItem[];
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
}
