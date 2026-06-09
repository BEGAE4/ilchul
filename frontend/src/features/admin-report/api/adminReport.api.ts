import axios from 'axios';
import type {
  AdminReportDetail,
  AdminReportListParams,
  AdminReportListResponse,
  IssueSanctionPayload,
  IssueSanctionResponse,
} from '../types';
import { reportFiltersToQuery } from '../utils';

export async function fetchAdminReports(
  params: AdminReportListParams,
  signal?: AbortSignal,
): Promise<AdminReportListResponse> {
  const res = await axios.get<AdminReportListResponse>('/api/admin/reports', {
    params: reportFiltersToQuery(params),
    signal,
  });
  return res.data;
}

export async function fetchAdminReportDetail(
  reportId: string,
  signal?: AbortSignal,
): Promise<AdminReportDetail> {
  const res = await axios.get<AdminReportDetail>(
    `/api/admin/reports/${reportId}`,
    { signal },
  );
  return res.data;
}

export async function patchAdminReportStatus(
  reportId: string,
  body: { status: 'REVIEWING' | 'REJECTED'; note?: string },
): Promise<AdminReportDetail> {
  const res = await axios.patch<AdminReportDetail>(
    `/api/admin/reports/${reportId}`,
    body,
  );
  return res.data;
}

export async function issueSanction(
  payload: IssueSanctionPayload,
): Promise<IssueSanctionResponse> {
  const res = await axios.post<IssueSanctionResponse>(
    `/api/admin/reports/${payload.reportId}/sanctions`,
    payload,
  );
  return res.data;
}
