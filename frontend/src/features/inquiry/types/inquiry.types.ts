/** 화면 탭 기준 상태 — 서버 inquiryStatus + hasAnswer 를 접은 값 */
export type InquiryStatus = 'PENDING' | 'ANSWERED';

/** 서버가 내려주는 문의 상태 */
export type ServerInquiryStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

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

/** 서버 목록 아이템(UserCsInquiryItemDto / AdminCsInquiryItemDto) — 빠진 필드가 와도 버티도록 전부 선택값 */
export interface ServerInquiryListItem {
  inquiryId?: number | null;
  title?: string | null;
  inquiryType?: InquiryType | null;
  inquiryStatus?: ServerInquiryStatus | null;
  hasAnswer?: boolean | null;
  authorNickname?: string | null; // 관리자 전체 목록에서만 내려옴
  createdAt?: string | null;
}

export interface ServerInquiryListResponse {
  items?: ServerInquiryListItem[] | null;
  nextCursorId?: number | null;
  hasNext?: boolean | null;
  totalCount?: number | null;
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

/** 작성 응답(CreateCsInquiryResponseDto) — 본문·이미지·답변은 내려오지 않는다 */
export interface CreateInquiryResult {
  inquiryId: number;
  title: string;
  inquiryType: InquiryType;
  inquiryStatus: ServerInquiryStatus;
  createdAt: string;
}

/** 수정 응답(UpdateCsInquiryResponseDto) — 이미지·답변은 내려오지 않는다 */
export interface UpdateInquiryResult {
  inquiryId: number;
  title: string;
  content: string;
  inquiryType: InquiryType;
  inquiryStatus: ServerInquiryStatus;
  updatedAt: string;
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
  newImages?: File[]; // 명세 필드명이 newImages 다 (작성은 images)
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

// 서버에 상태 필터가 없다 — 답변 대기/완료는 받아온 목록을 화면에서 나눈다
export interface FetchAllInquiriesParams {
  category?: InquiryType;
  search?: string;
  size?: number;
  lastInquiryId?: number;
}
