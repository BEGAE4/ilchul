import axios from 'axios';
import type {
  InquiryDetail,
  InquiryListResponse,
  InquiryCategoriesResponse,
  InquiryCategory,
  CreateInquiryInput,
  UpdateInquiryInput,
  CreateAnswerRequest,
  FetchAllInquiriesParams,
  InquiryAnswer,
} from '../types/inquiry.types';

const BASE = '/api/cs-inquiry';
const DEFAULT_PAGE_SIZE = 10;

/** 내 문의 목록 조회 (커서 페이징) — GET /api/cs-inquiry/my?size=&lastInquiryId= */
export const fetchMyInquiries = async (
  lastInquiryId?: number,
  size: number = DEFAULT_PAGE_SIZE
): Promise<InquiryListResponse> => {
  const res = await axios.get<InquiryListResponse>(`${BASE}/my`, {
    params: { size, lastInquiryId },
  });
  return res.data;
};

/** 전체 문의 목록 조회 (관리자) — GET /api/cs-inquiry?category=&search=&size=&lastInquiryId= */
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

/** 문의 작성 (multipart/form-data) — title, content, inquiryType, images */
export const createInquiry = async (
  input: CreateInquiryInput
): Promise<InquiryDetail> => {
  const fd = new FormData();
  fd.append('title', input.title);
  fd.append('content', input.content);
  fd.append('inquiryType', input.inquiryType);
  input.images.forEach((file) => fd.append('images', file));

  const res = await axios.post<InquiryDetail>(BASE, fd);
  return res.data;
};

/** 문의 수정 (multipart/form-data) — title, content, inquiryType, newImages, deleteImageIds */
export const updateInquiry = async (
  id: number,
  input: UpdateInquiryInput
): Promise<InquiryDetail> => {
  const fd = new FormData();
  if (input.title !== undefined) fd.append('title', input.title);
  if (input.content !== undefined) fd.append('content', input.content);
  if (input.inquiryType !== undefined) fd.append('inquiryType', input.inquiryType);
  input.newImages?.forEach((file) => fd.append('newImages', file));
  input.deleteImageIds?.forEach((imageId) => fd.append('deleteImageIds', String(imageId)));

  const res = await axios.patch<InquiryDetail>(`${BASE}/${id}`, fd);
  return res.data;
};

/** 문의 삭제 */
export const deleteInquiry = async (id: number): Promise<void> => {
  await axios.delete(`${BASE}/${id}`);
};

/** 문의 종료(완료) — 작성자, PATCH /api/cs-inquiry/{id}/close */
export const closeInquiry = async (id: number): Promise<void> => {
  await axios.patch(`${BASE}/${id}/close`);
};

/** 문의 답변 작성 (관리자) — POST /api/cs-inquiry/{id}/reply */
export const createAnswer = async (
  inquiryId: number,
  body: CreateAnswerRequest
): Promise<InquiryAnswer> => {
  const res = await axios.post<InquiryAnswer>(`${BASE}/${inquiryId}/reply`, body);
  return res.data;
};

/** 문의 카테고리(타입) 목록 조회 */
export const fetchInquiryCategories = async (): Promise<InquiryCategory[]> => {
  const res = await axios.get<InquiryCategoriesResponse>(`${BASE}/category`);
  return res.data.categories ?? [];
};
