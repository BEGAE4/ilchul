// cs-inquiry(고객 문의) 도메인 타입 — v5 명세(api-docs.json) 기준
// enum inquiryType: GENERAL|BUG|SUGGESTION|OTHER, inquiryStatus: OPEN|IN_PROGRESS|RESOLVED|CLOSED
export type InquiryStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type InquiryType = 'GENERAL' | 'BUG' | 'SUGGESTION' | 'OTHER';

export type InquirySection =
  | 'list'
  | 'detail'
  | 'create'
  | 'edit'
  | 'adminList'
  | 'adminAnswer';

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  GENERAL: '일반',
  BUG: '버그',
  SUGGESTION: '제안',
  OTHER: '기타',
};

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  OPEN: '접수',
  IN_PROGRESS: '처리 중',
  RESOLVED: '답변 완료',
  CLOSED: '종료',
};

// 상태 배지 색상 (Tailwind class)
export const INQUIRY_STATUS_BADGE_CLASS: Record<InquiryStatus, string> = {
  OPEN: 'bg-orange-50 text-orange-500',
  IN_PROGRESS: 'bg-blue-50 text-blue-500',
  RESOLVED: 'bg-green-50 text-green-600',
  CLOSED: 'bg-gray-100 text-gray-500',
};

export interface InquiryImage {
  imageId: number;
  url: string;
}

/** 목록(내 문의 / 관리자 전체)용 경량 아이템 — UserCsInquiryItemDto / AdminCsInquiryItemDto */
export interface InquiryListItem {
  inquiryId: number;
  title: string;
  inquiryType: InquiryType;
  inquiryStatus: InquiryStatus;
  hasAnswer: boolean;
  authorNickname?: string; // 관리자 전체 목록에서만 내려옴
  createdAt: string;
}

export interface InquiryAnswer {
  answerId: number;
  inquiryId: number;
  content: string;
  answeredBy: string;
  answeredAt: string;
}

/** 상세 조회용 전체 객체 */
export interface InquiryDetail {
  inquiryId: number;
  title: string;
  content: string;
  inquiryType: InquiryType;
  inquiryStatus: InquiryStatus;
  hasAnswer: boolean;
  images: InquiryImage[];
  authorNickname?: string;
  createdAt: string;
  updatedAt: string;
  answer: InquiryAnswer | null;
}

/** 문의 작성 — CreateCsInquiryRequestDto: title, content, inquiryType, images */
export interface CreateInquiryInput {
  title: string;
  content: string;
  inquiryType: InquiryType;
  images: File[];
}

/** 문의 수정 — UpdateCsInquiryRequestDto: title, content, inquiryType, newImages, deleteImageIds */
export interface UpdateInquiryInput {
  title?: string;
  content?: string;
  inquiryType?: InquiryType;
  newImages?: File[];
  deleteImageIds?: number[];
}

/** 답변 작성 — ReplyCsInquiryRequestDto */
export interface CreateAnswerRequest {
  content: string;
}

export interface InquiryListResponse {
  items: InquiryListItem[];
  nextCursorId: number | null;
  hasNext: boolean;
  totalCount?: number; // 관리자 목록에만 포함
}

export interface InquiryCategory {
  slug: InquiryType;
  name: string;
}

export interface InquiryCategoriesResponse {
  categories: InquiryCategory[];
}

/** 관리자 목록 조회 쿼리 — GET /api/cs-inquiry */
export interface FetchAllInquiriesParams {
  category?: string;
  search?: string;
  size?: number;
  lastInquiryId?: number;
}
