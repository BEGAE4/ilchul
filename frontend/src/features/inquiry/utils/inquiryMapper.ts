import { INQUIRY_TYPE_LABELS } from '../types/inquiry.types';
import type {
  InquiryAnswer,
  InquiryDetail,
  InquiryImage,
  InquiryListItem,
  InquiryListResponse,
  InquiryStatus,
  InquiryType,
  ServerInquiryListItem,
  ServerInquiryListResponse,
} from '../types/inquiry.types';

const NO_TITLE = '(제목 없음)';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asInquiryType(value: unknown): InquiryType {
  return typeof value === 'string' && value in INQUIRY_TYPE_LABELS ? (value as InquiryType) : 'OTHER';
}

/** 서버 상태 + 답변 여부 → 화면 탭 상태. 답변이 달렸거나 처리·종료된 문의는 '답변 완료'로 본다 */
export function toInquiryStatus(inquiryStatus: unknown, hasAnswer: unknown): InquiryStatus {
  if (hasAnswer === true) return 'ANSWERED';
  if (inquiryStatus === 'RESOLVED' || inquiryStatus === 'CLOSED') return 'ANSWERED';
  return 'PENDING';
}

/** 서버 목록 아이템 → 화면 목록 아이템. 열 수도 없는(ID 없는) 항목은 null 로 버린다 */
export function toInquiryListItem(
  raw: ServerInquiryListItem | null | undefined
): InquiryListItem | null {
  if (!raw || typeof raw.inquiryId !== 'number') return null;

  const item: InquiryListItem = {
    inquiryId: raw.inquiryId,
    title: asString(raw.title).trim() || NO_TITLE,
    categoryName: INQUIRY_TYPE_LABELS[asInquiryType(raw.inquiryType)],
    status: toInquiryStatus(raw.inquiryStatus, raw.hasAnswer),
    hasAnswer: raw.hasAnswer === true,
    createdAt: asString(raw.createdAt),
  };
  if (raw.authorNickname) item.authorNickname = raw.authorNickname;
  return item;
}

/** 목록 응답 전체 변환 — items 가 없거나 배열이 아니어도 빈 목록으로 버틴다 */
export function toInquiryListResponse(
  raw: ServerInquiryListResponse | null | undefined
): InquiryListResponse {
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const nextCursorId = typeof raw?.nextCursorId === 'number' ? raw.nextCursorId : null;

  const res: InquiryListResponse = {
    items: items
      .map((item) => toInquiryListItem(item))
      .filter((item): item is InquiryListItem => item !== null),
    nextCursorId,
    // 커서가 없으면 더 읽을 방법이 없으므로 hasNext 를 믿지 않는다
    hasNext: raw?.hasNext === true && nextCursorId !== null,
  };
  if (typeof raw?.totalCount === 'number') res.totalCount = raw.totalCount;
  return res;
}

function toInquiryImages(raw: unknown): InquiryImage[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((img) => {
    if (!isRecord(img)) return [];
    const url = asString(img.url) || asString(img.imageUrl);
    return typeof img.imageId === 'number' && url ? [{ imageId: img.imageId, url }] : [];
  });
}

function toInquiryAnswer(raw: unknown, inquiryId: number): InquiryAnswer | null {
  if (!isRecord(raw) || !asString(raw.content)) return null;
  return {
    answerId: typeof raw.answerId === 'number' ? raw.answerId : 0,
    inquiryId,
    content: asString(raw.content),
    answeredBy: asString(raw.answeredBy),
    answeredAt: asString(raw.answeredAt),
  };
}

/**
 * 상세 응답 → 화면 상세 객체.
 * 상세 API 는 아직 없다. 추가될 때 목록처럼 inquiryStatus/inquiryType 으로 내려와도,
 * 화면 필드명(status/categoryName) 그대로 내려와도 받도록 양쪽을 모두 읽는다.
 * 문의로 볼 수 없는 응답(ID 없음)은 null.
 */
export function toInquiryDetail(raw: unknown): InquiryDetail | null {
  if (!isRecord(raw) || typeof raw.inquiryId !== 'number') return null;

  const inquiryType = asInquiryType(raw.inquiryType);
  const answer = toInquiryAnswer(raw.answer, raw.inquiryId);
  const status: InquiryStatus =
    raw.status === 'PENDING' || raw.status === 'ANSWERED'
      ? raw.status
      : toInquiryStatus(raw.inquiryStatus, raw.hasAnswer === true || answer !== null);
  const createdAt = asString(raw.createdAt);

  const detail: InquiryDetail = {
    inquiryId: raw.inquiryId,
    title: asString(raw.title).trim() || NO_TITLE,
    content: asString(raw.content),
    categoryId: typeof raw.categoryId === 'number' ? raw.categoryId : 0,
    categoryName: asString(raw.categoryName) || INQUIRY_TYPE_LABELS[inquiryType],
    inquiryType,
    status,
    images: toInquiryImages(raw.images),
    createdAt,
    updatedAt: asString(raw.updatedAt) || createdAt,
    answer,
  };
  const authorNickname = asString(raw.authorNickname);
  if (authorNickname) detail.authorNickname = authorNickname;
  return detail;
}

/** 탭(답변 대기/완료)별로 화면에서 거른다 — 서버에 상태 필터가 없다 */
export function filterInquiriesByStatus(
  items: InquiryListItem[],
  status: InquiryStatus
): InquiryListItem[] {
  return items.filter((item) => item.status === status);
}

/** 'YYYY.MM.DD' (withTime 이면 ' HH:mm' 까지). 날짜가 없거나 깨져 있으면 빈 문자열 */
export function formatInquiryDate(iso: string | null | undefined, withTime = false): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
  return withTime ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
}
