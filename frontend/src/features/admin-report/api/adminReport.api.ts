import axios from 'axios';
import apiClient from '@/shared/lib/api/apiClient';
import type {
  AdminReportDetail,
  AdminReportListParams,
  AdminReportListResponse,
  IssueSanctionPayload,
  IssueSanctionResponse,
} from '../types';
import { reportFiltersToQuery } from '../utils';
import {
  TARGET_TYPE_TO_SERVER,
  SORT_TO_SERVER,
  mapServerList,
  mapServerDetail,
  type ServerAdminReportListResponse,
  type ServerAdminReportDetail,
} from '../utils/serverReportMapper';

// v5 백엔드(GET /api/admin/reports)를 우선 호출하고,
// 실패(백엔드 미기동 등) 시 기존 BFF 목 라우트로 폴백해 관리자 화면을 유지한다.

function toServerQuery(params: AdminReportListParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.status && params.status !== 'all') out.status = params.status;
  if (params.targetType && params.targetType !== 'all')
    out.targetType = TARGET_TYPE_TO_SERVER[params.targetType];
  if (params.reasonCode && params.reasonCode !== 'all') out.reasonCode = params.reasonCode;
  if (params.q?.trim()) out.q = params.q.trim();
  if (params.page) out.page = String(params.page);
  if (params.size) out.size = String(params.size);
  if (params.sort) out.sort = SORT_TO_SERVER[params.sort];
  if (params.autoBlindedOnly) out.autoBlindedOnly = 'true';
  return out;
}

export async function fetchAdminReports(
  params: AdminReportListParams,
  signal?: AbortSignal,
): Promise<AdminReportListResponse> {
  try {
    const res = await apiClient.get<ServerAdminReportListResponse>('/api/admin/reports', {
      params: toServerQuery(params),
      signal,
    });
    return mapServerList(res.data);
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    console.error('관리자 신고 목록 v5 호출 실패 (BFF 목으로 폴백):', err);
    const res = await axios.get<AdminReportListResponse>('/api/admin/reports', {
      params: reportFiltersToQuery(params),
      signal,
    });
    return res.data;
  }
}

export async function fetchAdminReportDetail(
  reportId: string,
  signal?: AbortSignal,
): Promise<AdminReportDetail> {
  try {
    const res = await apiClient.get<ServerAdminReportDetail>(
      `/api/admin/reports/${reportId}`,
      { signal },
    );
    return mapServerDetail(res.data);
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    console.error('관리자 신고 상세 v5 호출 실패 (BFF 목으로 폴백):', err);
    const res = await axios.get<AdminReportDetail>(
      `/api/admin/reports/${reportId}`,
      { signal },
    );
    return res.data;
  }
}

export async function patchAdminReportStatus(
  reportId: string,
  body: { status: 'REVIEWING' | 'REJECTED'; note?: string },
): Promise<AdminReportDetail> {
  try {
    const res = await apiClient.patch<ServerAdminReportDetail>(
      `/api/admin/reports/${reportId}`,
      body,
    );
    return mapServerDetail(res.data);
  } catch (err) {
    console.error('관리자 신고 상태 변경 v5 호출 실패 (BFF 목으로 폴백):', err);
    const res = await axios.patch<AdminReportDetail>(
      `/api/admin/reports/${reportId}`,
      body,
    );
    return res.data;
  }
}

// 제재 발급 — v5 명세에 대응 엔드포인트 없음. 기존 BFF 목 라우트 유지.
export async function issueSanction(
  payload: IssueSanctionPayload,
): Promise<IssueSanctionResponse> {
  const res = await axios.post<IssueSanctionResponse>(
    `/api/admin/reports/${payload.reportId}/sanctions`,
    payload,
  );
  return res.data;
}
