import apiClient from '@/shared/lib/api/apiClient';
import type {
  ReportPayload,
  ReportResponse,
  ReportTargetType,
  ReportReasonCode,
  ReportStatus,
} from '../types';

// ── v6 서버 DTO (cc/api/v6/260723-v6-008-report.md) ──────────────

type ServerTargetType = 'PLAN' | 'REPLY' | 'USER';

const TARGET_TYPE_TO_SERVER: Record<ReportTargetType, ServerTargetType> = {
  course: 'PLAN',
  comment: 'REPLY',
  user: 'USER',
};

interface CreateReportResponseDto {
  reportId: number;
  reportType: ServerTargetType;
  status: ReportStatus;
  alreadyReported: boolean;
  isAutoBlinded: boolean;
}

export interface ReportReasonItem {
  code: ReportReasonCode;
  label: string;
  requiresContent: boolean;
}

interface ReportReasonResponseDto {
  reportType: ServerTargetType;
  reasonItems: ReportReasonItem[];
}

// ── API ──────────────────────────────────────────────────────────

// 신고 접수 — v6: POST /api/report (CreateReportRequestDto)
export async function submitReport(payload: ReportPayload): Promise<ReportResponse> {
  const { data } = await apiClient.post<CreateReportResponseDto>('/api/report', {
    targetType: TARGET_TYPE_TO_SERVER[payload.target.type],
    targetId: Number(payload.target.id),
    reasonCode: payload.reasonCode,
    detail: payload.detail,
  });
  return {
    reportId: String(data.reportId),
    status: data.status,
    alreadyReported: data.alreadyReported,
    autoBlinded: data.isAutoBlinded,
  };
}

// 신고 사유 목록 조회 — v5: GET /api/report/reason?type=
export async function fetchReportReasons(
  targetType: ReportTargetType
): Promise<ReportReasonItem[]> {
  const { data } = await apiClient.get<ReportReasonResponseDto>('/api/report/reason', {
    params: { type: TARGET_TYPE_TO_SERVER[targetType] },
  });
  return data.reasonItems;
}
