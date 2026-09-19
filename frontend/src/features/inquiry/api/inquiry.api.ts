import axios from 'axios';
import type {
  InquiryDetail,
  InquiryListItem,
  InquiryListResponse,
  InquiryCategoriesResponse,
  InquiryCategory,
  CreateInquiryInput,
  CreateInquiryResult,
  UpdateInquiryInput,
  UpdateInquiryResult,
  CreateAnswerRequest,
  FetchAllInquiriesParams,
  InquiryAnswer,
  ServerInquiryListResponse,
} from '../types/inquiry.types';
import { prepareImagesForOneRequest } from '@/shared/lib/image';
import { toInquiryDetail, toInquiryListResponse } from '../utils/inquiryMapper';

const BASE = '/api/cs-inquiry';
const DEFAULT_PAGE_SIZE = 10;
// 탭(답변 대기/완료)을 화면에서 나누려면 목록 전체가 필요하다 — 크게 끊어 끝까지 읽되 상한을 둔다
const MY_LIST_PAGE_SIZE = 50;
const MY_LIST_MAX_PAGES = 10;

/** 내 문의 목록 한 페이지 — GET /api/cs-inquiry/my?size=&lastInquiryId= (서버에 상태 필터 없음) */
export const fetchMyInquiries = async (
  lastInquiryId?: number,
  size: number = DEFAULT_PAGE_SIZE
): Promise<InquiryListResponse> => {
  const res = await axios.get<ServerInquiryListResponse>(`${BASE}/my`, {
    params: { size, lastInquiryId },
  });
  return toInquiryListResponse(res.data);
};

/** 내 문의 전체 — 커서를 따라 끝까지 읽는다 */
export const fetchAllMyInquiries = async (): Promise<InquiryListItem[]> => {
  const all: InquiryListItem[] = [];
  let cursor: number | undefined;
  for (let page = 0; page < MY_LIST_MAX_PAGES; page += 1) {
    const res = await fetchMyInquiries(cursor, MY_LIST_PAGE_SIZE);
    all.push(...res.items);
    // 커서가 그대로면 같은 페이지를 되풀이하게 되므로 멈춘다
    if (!res.hasNext || res.nextCursorId === null || res.nextCursorId === cursor) break;
    cursor = res.nextCursorId;
  }
  return all;
};

/** 전체 문의 목록 조회 (관리자) — GET /api/cs-inquiry?category=&search=&size=&lastInquiryId= */
export const fetchAllInquiries = async (
  params: FetchAllInquiriesParams = {}
): Promise<InquiryListResponse> => {
  const res = await axios.get<ServerInquiryListResponse>(BASE, { params });
  return toInquiryListResponse(res.data);
};

/**
 * 문의 상세 조회 — GET /api/cs-inquiry/{inquiryId}
 * 백엔드에 아직 없는 엔드포인트라 지금은 실패한다(화면은 목록 정보로 대신 그린다).
 * 백엔드에 추가되면 이 경로 그대로 동작한다.
 */
export const fetchInquiryDetail = async (id: number): Promise<InquiryDetail> => {
  const res = await axios.get<unknown>(`${BASE}/${id}`);
  const detail = toInquiryDetail(res.data);
  if (!detail) throw new Error('문의 상세 응답 형식이 올바르지 않습니다.');
  return detail;
};

/** 문의 작성 (multipart/form-data) */
export const createInquiry = async (
  input: CreateInquiryInput
): Promise<CreateInquiryResult> => {
  const fd = new FormData();
  fd.append('title', input.title);
  fd.append('content', input.content);
  fd.append('categoryId', String(input.categoryId));
  fd.append('inquiryType', input.inquiryType);
  // 첨부는 글과 한 요청에 담아야 한다. 앞단 업로드 제한(1MB)이 요청 전체에 걸리므로 장수만큼 용량을 나눠 줄인다
  (await prepareImagesForOneRequest(input.images)).forEach((file) => fd.append('images', file));

  const res = await axios.post<CreateInquiryResult>(BASE, fd);
  return res.data;
};

/** 문의 수정 (multipart/form-data) */
export const updateInquiry = async (
  id: number,
  input: UpdateInquiryInput
): Promise<UpdateInquiryResult> => {
  const fd = new FormData();
  if (input.title !== undefined) fd.append('title', input.title);
  if (input.content !== undefined) fd.append('content', input.content);
  if (input.categoryId !== undefined) fd.append('categoryId', String(input.categoryId));
  if (input.inquiryType !== undefined) fd.append('inquiryType', input.inquiryType);
  // 수정은 새 파일 필드명이 newImages 다 (작성의 images 와 다름)
  if (input.newImages) {
    (await prepareImagesForOneRequest(input.newImages)).forEach((file) =>
      fd.append('newImages', file)
    );
  }
  input.deleteImageIds?.forEach((imageId) => fd.append('deleteImageIds', String(imageId)));

  const res = await axios.patch<UpdateInquiryResult>(`${BASE}/${id}`, fd);
  return res.data;
};

/** 문의 삭제 */
export const deleteInquiry = async (id: number): Promise<void> => {
  await axios.delete(`${BASE}/${id}`);
};

/** 문의 답변 작성 (관리자) — POST /api/cs-inquiry/{inquiryId}/reply. 운영은 BFF 없이 백엔드로 바로 가므로 경로가 명세와 같아야 한다 */
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
