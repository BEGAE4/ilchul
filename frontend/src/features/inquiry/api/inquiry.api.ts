import axios from 'axios';
import type {
  InquiryDetail,
  InquiryListResponse,
  InquiryCategoriesResponse,
  InquiryCategory,
  InquiryStatus,
  CreateInquiryInput,
  UpdateInquiryInput,
  CreateAnswerRequest,
  FetchAllInquiriesParams,
  InquiryAnswer,
} from '../types/inquiry.types';

const BASE = '/api/cs-inquiry';

/** 내 문의 목록 조회 (답변 대기/완료 구분) */
export const fetchMyInquiries = async (
  status?: InquiryStatus,
  cursorId?: number
): Promise<InquiryListResponse> => {
  const res = await axios.get<InquiryListResponse>(`${BASE}/me`, {
    params: { status, cursorId },
  });
  return res.data;
};

/** 전체 문의 목록 조회 (관리자) */
export const fetchAllInquiries = async (
  params: FetchAllInquiriesParams = {}
): Promise<InquiryListResponse> => {
  const res = await axios.get<InquiryListResponse>(BASE, { params });
  return res.data;
};

/** 문의 상세 조회 */
export const fetchInquiryDetail = async (id: number): Promise<InquiryDetail> => {
  const res = await axios.get<InquiryDetail>(`${BASE}/${id}`);
  return res.data;
};

/** 문의 작성 (multipart/form-data) */
export const createInquiry = async (
  input: CreateInquiryInput
): Promise<InquiryDetail> => {
  const fd = new FormData();
  fd.append('title', input.title);
  fd.append('content', input.content);
  fd.append('categoryId', String(input.categoryId));
  fd.append('inquiryType', input.inquiryType);
  input.images.forEach((file) => fd.append('images', file));

  const res = await axios.post<InquiryDetail>(BASE, fd);
  return res.data;
};

/** 문의 수정 (multipart/form-data) */
export const updateInquiry = async (
  id: number,
  input: UpdateInquiryInput
): Promise<InquiryDetail> => {
  const fd = new FormData();
  if (input.title !== undefined) fd.append('title', input.title);
  if (input.content !== undefined) fd.append('content', input.content);
  if (input.categoryId !== undefined) fd.append('categoryId', String(input.categoryId));
  if (input.inquiryType !== undefined) fd.append('inquiryType', input.inquiryType);
  input.images?.forEach((file) => fd.append('images', file));
  input.deleteImageIds?.forEach((imageId) => fd.append('deleteImageIds', String(imageId)));

  const res = await axios.patch<InquiryDetail>(`${BASE}/${id}`, fd);
  return res.data;
};

/** 문의 삭제 */
export const deleteInquiry = async (id: number): Promise<void> => {
  await axios.delete(`${BASE}/${id}`);
};

/** 문의 답변 작성 (관리자) */
export const createAnswer = async (
  inquiryId: number,
  body: CreateAnswerRequest
): Promise<InquiryAnswer> => {
  const res = await axios.post<InquiryAnswer>(`${BASE}/${inquiryId}`, body);
  return res.data;
};

/** 문의 카테고리(타입) 목록 조회 */
export const fetchInquiryCategories = async (): Promise<InquiryCategory[]> => {
  const res = await axios.get<InquiryCategoriesResponse>(`${BASE}/category`);
  return res.data.categories ?? [];
};
