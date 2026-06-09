export type InquiryCategory =
  | 'ACCOUNT'
  | 'CONTENT'
  | 'REPORT_APPEAL'
  | 'BUG'
  | 'FEATURE'
  | 'ETC';

export const INQUIRY_CATEGORY_LABELS: Record<InquiryCategory, string> = {
  ACCOUNT: '계정/로그인',
  CONTENT: '콘텐츠 관련',
  REPORT_APPEAL: '신고/제재 이의제기',
  BUG: '버그 신고',
  FEATURE: '기능 제안',
  ETC: '기타',
};

export type InquiryStatus = 'OPEN' | 'ANSWERED' | 'CLOSED';

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  OPEN: '미답변',
  ANSWERED: '답변완료',
  CLOSED: '마감',
};

export interface InquiryAuthor {
  userId: string;
  nickname: string;
  email: string | null;
}

export interface InquiryAttachment {
  id: string;
  name: string;
  url: string;
}

export interface InquiryAnswer {
  answerId: string;
  body: string;
  authorOperatorId: string;
  authorOperatorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminInquiryListItem {
  inquiryId: string;
  title: string;
  category: InquiryCategory;
  author: InquiryAuthor;
  status: InquiryStatus;
  hasUnreadByAuthor: boolean;
  answerCount: number;
  createdAt: string;
  updatedAt: string;
  assignedOperator: string | null;
}

export interface AdminInquiryDetail extends AdminInquiryListItem {
  body: string;
  attachments: InquiryAttachment[];
  answers: InquiryAnswer[];
}

export interface CreateAnswerPayload {
  body: string;
  closeAfter?: boolean;
}

export interface UpdateAnswerPayload {
  body: string;
}

export type AdminInquirySort = 'createdAt:desc' | 'updatedAt:desc';

export interface AdminInquiryListParams {
  status?: InquiryStatus | 'all';
  category?: InquiryCategory | 'all';
  q?: string;
  page?: number;
  size?: number;
  sort?: AdminInquirySort;
}

export interface AdminInquiryListResponse {
  data: AdminInquiryListItem[];
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
}
