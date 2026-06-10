import { NextRequest, NextResponse } from 'next/server';
import type { InquiryStatus } from '@/features/inquiry/types/inquiry.types';
import { mockCreated, mockListResponse } from './_mock';

/** GET 전체 문의 조회 (관리자) — ?category=&search=&status=&lastInquiryId= */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { search } = new URL(request.url);
  const status = request.nextUrl.searchParams.get('status') as InquiryStatus | null;

  if (!baseUrl) {
    return NextResponse.json(mockListResponse({ mine: false, status }));
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry${search}`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json(mockListResponse({ mine: false, status }));
  }

  const data = await res.json().catch(() => mockListResponse({ mine: false, status }));
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
