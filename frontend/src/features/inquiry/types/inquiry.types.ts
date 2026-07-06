export type InquiryStatus = 'PENDING' | 'ANSWERED';

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

// inquiryType → categoryId 고정 매핑 (카테고리 조회 API가 숫자 ID를 내려주지 않아 프론트에서 매핑)
export const INQUIRY_TYPE_CATEGORY_ID: Record<InquiryType, number> = {
  GENERAL: 1,
  BUG: 2,
  SUGGESTION: 3,
  OTHER: 4,
};

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  PENDING: '답변 대기',
  ANSWERED: '답변 완료',
};

export interface InquiryImage {
  imageId: number;
  url: string;
}

/** 목록(내 문의 / 전체 문의)용 경량 아이템 */
export interface InquiryListItem {
  inquiryId: number;
  title: string;
  categoryName: string;
  status: InquiryStatus;
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
  categoryId: number;
  categoryName: string;
  inquiryType: InquiryType;
  status: InquiryStatus;
  images: InquiryImage[];
  authorNickname?: string;
  createdAt: string;
  updatedAt: string;
  answer: InquiryAnswer | null;
}

export interface CreateInquiryInput {
  title: string;
  content: string;
  categoryId: number;
  inquiryType: InquiryType;
  images: File[];
}

export interface UpdateInquiryInput {
  title?: string;
  content?: string;
  categoryId?: number;
  inquiryType?: InquiryType;
  images?: File[];
  deleteImageIds?: number[];
}

export interface CreateAnswerRequest {
  content: string;
}

export interface InquiryListResponse {
  items: InquiryListItem[];
  nextCursorId: number | null;
  hasNext: boolean;
  totalCount?: number;
}

export interface InquiryCategory {
  slug: InquiryType;
  name: string;
}

export interface InquiryCategoriesResponse {
  categories: InquiryCategory[];
}

export interface FetchAllInquiriesParams {
  category?: string;
  search?: string;
  status?: InquiryStatus;
  lastInquiryId?: number;
}
