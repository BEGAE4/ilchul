import axios from 'axios';
import apiClient from '@/shared/lib/api/apiClient';
import type {
  ReportPayload,
  ReportResponse,
  ReportTargetType,
  ReportReasonCode,
  ReportStatus,
} from '../types';
import { buildIdempotencyKey } from '../utils/buildIdempotencyKey';

// ── v5 서버 DTO (cc/api/v5/260705-v5-008-report.md) ──────────────

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

// 신고 접수 — v5: POST /api/report
// 대상 id가 숫자(서버 데이터)면 백엔드 직접 호출, 목데이터 id면 기존 BFF(/api/reports)로 폴백
export async function submitReport(
  payload: ReportPayload,
  ctx: { reporterId: string; attemptId: string }
): Promise<ReportResponse> {
  const numericTargetId = /^\d+$/.test(payload.target.id) ? Number(payload.target.id) : null;

  if (numericTargetId !== null) {
    const { data } = await apiClient.post<CreateReportResponseDto>('/api/report', {
      targetType: TARGET_TYPE_TO_SERVER[payload.target.type],
      targetId: numericTargetId,
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

  // 목데이터 대상 — 기존 BFF 목 라우트 유지
  const res = await axios.post<ReportResponse>('/api/reports', payload, {
    headers: {
      'idempotency-key': buildIdempotencyKey({
        reporterId: ctx.reporterId,
        attemptId: ctx.attemptId,
        target: payload.target,
        reasonCode: payload.reasonCode,
      }),
    },
  });
  return res.data;
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
