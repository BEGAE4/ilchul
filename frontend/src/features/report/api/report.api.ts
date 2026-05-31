import axios from 'axios';
import type { ReportPayload, ReportResponse } from '../types';
import { buildIdempotencyKey } from '../utils/buildIdempotencyKey';

export async function submitReport(
  payload: ReportPayload,
  ctx: { reporterId: string; attemptId: string }
): Promise<ReportResponse> {
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
