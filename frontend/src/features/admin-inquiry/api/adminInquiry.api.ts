import axios from 'axios';
import type {
  AdminInquiryDetail,
  AdminInquiryListParams,
  AdminInquiryListResponse,
  CreateAnswerPayload,
  InquiryStatus,
  UpdateAnswerPayload,
} from '../types';
import { inquiryFiltersToQuery } from '../utils';

export async function fetchAdminInquiries(
  params: AdminInquiryListParams,
  signal?: AbortSignal,
): Promise<AdminInquiryListResponse> {
  const res = await axios.get<AdminInquiryListResponse>('/api/admin/inquiries', {
    params: inquiryFiltersToQuery(params),
    signal,
  });
  return res.data;
}

export async function fetchAdminInquiryDetail(
  inquiryId: string,
  signal?: AbortSignal,
): Promise<AdminInquiryDetail> {
  const res = await axios.get<AdminInquiryDetail>(
    `/api/admin/inquiries/${inquiryId}`,
    { signal },
  );
  return res.data;
}

export async function patchAdminInquiryStatus(
  inquiryId: string,
  body: { status: InquiryStatus },
): Promise<AdminInquiryDetail> {
  const res = await axios.patch<AdminInquiryDetail>(
    `/api/admin/inquiries/${inquiryId}`,
    body,
  );
  return res.data;
}

export async function createInquiryAnswer(
  inquiryId: string,
  payload: CreateAnswerPayload,
): Promise<AdminInquiryDetail> {
  const res = await axios.post<AdminInquiryDetail>(
    `/api/admin/inquiries/${inquiryId}/answers`,
    payload,
  );
  return res.data;
}

export async function updateInquiryAnswer(
  inquiryId: string,
  answerId: string,
  payload: UpdateAnswerPayload,
): Promise<AdminInquiryDetail> {
  const res = await axios.patch<AdminInquiryDetail>(
    `/api/admin/inquiries/${inquiryId}/answers/${answerId}`,
    payload,
  );
  return res.data;
}

export async function deleteInquiryAnswer(
  inquiryId: string,
  answerId: string,
): Promise<AdminInquiryDetail> {
  const res = await axios.delete<AdminInquiryDetail>(
    `/api/admin/inquiries/${inquiryId}/answers/${answerId}`,
  );
  return res.data;
}
