// v5 관리자 신고 DTO ↔ 프론트 타입 매핑 (cc/api/v5/260705-v5-008-report.md)
import type { ReportTarget, ReportTargetType, ReportReasonCode, ReportStatus } from '@/features/report/types/report';
import type {
  AdminReportListItem,
  AdminReportDetail,
  AdminReportListResponse,
  AdminReportSort,
  ReportResolution,
} from '../types';

export type ServerTargetType = 'PLAN' | 'REPLY' | 'USER';

export const TARGET_TYPE_TO_SERVER: Record<ReportTargetType, ServerTargetType> = {
  course: 'PLAN',
  comment: 'REPLY',
  user: 'USER',
};

const TARGET_TYPE_FROM_SERVER: Record<ServerTargetType, ReportTargetType> = {
  PLAN: 'course',
  REPLY: 'comment',
  USER: 'user',
};

export const SORT_TO_SERVER: Record<AdminReportSort, string> = {
  'createdAt:desc': 'CREATED_DESC',
  'createdAt:asc': 'CREATED_ASC',
  'reportCount:desc': 'REPORT_COUNT_DESC',
};

interface ServerReportTarget {
  type: ServerTargetType;
  id: number;
  ownerId: string;
  title: string;
  contextUrl: string;
}

export interface ServerAdminReportItem {
  reportId: number;
  reasonCode: ReportReasonCode;
  status: ReportStatus;
  reporterId: number;
  reporterNickname: string;
  createdAt: string;
  updatedAt: string;
  assignedOperator: string | number | null;
  reportCount: number;
  autoBlinded: boolean;
  target: ServerReportTarget;
}

export interface ServerAdminReportDetail extends ServerAdminReportItem {
  resolution: ReportResolution | null;
  detail: string | null;
  histories: { status: ReportStatus; at: string; actor: string; note?: string }[];
  relatedReports: {
    reportId: number;
    reasonCode: ReportReasonCode;
    reporterNickname: string;
    createdAt: string;
  }[];
}

export interface ServerAdminReportListResponse {
  data: ServerAdminReportItem[];
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
}

// 서버 target(평면 구조)을 프론트 discriminated union으로 변환.
// 서버 DTO에는 comment의 courseId/snippet, user의 nickname 전용 필드가 없어 best-effort 매핑한다.
function mapTarget(t: ServerReportTarget): ReportTarget {
  const base = {
    id: String(t.id),
    ownerId: t.ownerId ?? '',
    contextUrl: t.contextUrl ?? '',
  };
  switch (t.type) {
    case 'PLAN':
      return { type: 'course', ...base, title: t.title ?? '' };
    case 'REPLY': {
      const courseId = /\/course\/([^/#?]+)/.exec(t.contextUrl ?? '')?.[1] ?? '';
      return { type: 'comment', ...base, courseId, snippet: t.title ?? '' };
    }
    case 'USER':
      return { type: 'user', ...base, nickname: t.title ?? '' };
  }
}

export function mapServerItem(item: ServerAdminReportItem): AdminReportListItem {
  return {
    reportId: String(item.reportId),
    target: mapTarget(item.target),
    reasonCode: item.reasonCode,
    status: item.status,
    reporterId: String(item.reporterId),
    reporterNickname: item.reporterNickname,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    assignedOperator: item.assignedOperator != null ? String(item.assignedOperator) : null,
    reportCount: item.reportCount,
    autoBlinded: item.autoBlinded,
  };
}

export function mapServerDetail(d: ServerAdminReportDetail): AdminReportDetail {
  return {
    ...mapServerItem(d),
    detail: d.detail ?? null,
    history: (d.histories ?? []).map((h) => ({
      status: h.status,
      at: h.at,
      actor: h.actor,
      note: h.note,
    })),
    relatedReports: (d.relatedReports ?? []).map((r) => ({
      reportId: String(r.reportId),
      reasonCode: r.reasonCode,
      reporterNickname: r.reporterNickname,
      createdAt: r.createdAt,
    })),
    resolution: d.resolution ?? null,
  };
}

export function mapServerList(res: ServerAdminReportListResponse): AdminReportListResponse {
  return {
    data: (res.data ?? []).map(mapServerItem),
    totalCount: res.totalCount,
    page: res.page,
    size: res.size,
    hasNext: res.hasNext,
  };
}
