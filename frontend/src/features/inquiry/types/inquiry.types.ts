export type InquiryStatus = 'pending' | 'answered';

export type InquiryCategory = 'account' | 'payment' | 'bug' | 'feature' | 'content' | 'other';

export type InquirySection = 'list' | 'detail' | 'create' | 'edit' | 'adminList' | 'adminAnswer';

export const INQUIRY_CATEGORY_LABELS: Record<InquiryCategory, string> = {
  account: '계정',
  payment: '결제',
  bug: '오류/버그',
  feature: '기능 제안',
  content: '콘텐츠',
  other: '기타',
};

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  pending: '답변 대기',
  answered: '답변 완료',
};

export interface InquiryAnswer {
  answerId: number;
  content: string;
  createdAt: string;
  adminName: string;
}

export interface Inquiry {
  inquiryId: number;
  userId: string;
  userNickname: string;
  category: InquiryCategory;
  title: string;
  content: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  answer: InquiryAnswer | null;
}

export interface CreateInquiryRequest {
  category: InquiryCategory;
  title: string;
  content: string;
}

export interface UpdateInquiryRequest {
  category?: InquiryCategory;
  title?: string;
  content?: string;
}

export interface CreateAnswerRequest {
  content: string;
}

export interface InquiryListResponse {
  inquiries: Inquiry[];
}

export interface InquiryCategoryItem {
  id: InquiryCategory;
  label: string;
}

export interface InquiryCategoriesResponse {
  categories: InquiryCategoryItem[];
}
