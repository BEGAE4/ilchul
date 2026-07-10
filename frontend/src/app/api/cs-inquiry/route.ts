import { NextRequest, NextResponse } from 'next/server';
import type { InquiryStatus } from '@/features/inquiry/types/inquiry.types';
import { mockCreated, mockListResponse } from './_mock';

/**
 * GET 문의 목록 조회
 * - 내 문의:   ?size=&lastInquiryId=&status=  (size 파라미터로 식별)
 * - 전체(관리자): ?category=&search=&status=&lastInquiryId=
 * 실서버에서는 인증 역할로 범위가 결정되며, mock 에서는 size 유무로 구분한다.
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { search } = new URL(request.url);
  const params = request.nextUrl.searchParams;
  const status = params.get('status') as InquiryStatus | null;
  const mine = params.has('size');

  if (!baseUrl) {
    return NextResponse.json(mockListResponse({ mine, status }));
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry${search}`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json(mockListResponse({ mine, status }));
  }

  const data = await res.json().catch(() => mockListResponse({ mine, status }));
  return NextResponse.json(data);
}

/** POST 문의 작성 — multipart/form-data */
export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const formData = await request.formData().catch(() => null);

  if (!baseUrl) {
    return NextResponse.json(mockCreated(formData), { status: 201 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  // FormData를 그대로 포워딩 — Content-Type은 fetch가 boundary와 함께 자동 설정
  const res = await fetch(`${baseUrl}/api/cs-inquiry`, {
    method: 'POST',
    headers: cookie ? { cookie } : undefined,
    body: formData ?? undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    // 백엔드 미동작 시 mock 으로 폴백 (로컬 개발 지원)
    return NextResponse.json(mockCreated(formData), { status: 201 });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
