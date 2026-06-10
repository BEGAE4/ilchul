import { NextRequest, NextResponse } from 'next/server';
import type { InquiryStatus } from '@/features/inquiry/types/inquiry.types';
import { mockListResponse } from '../_mock';

/** GET 내 문의 목록 조회 — ?status=&cursorId= */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { search } = new URL(request.url);
  const status = request.nextUrl.searchParams.get('status') as InquiryStatus | null;

  if (!baseUrl) {
    return NextResponse.json(mockListResponse({ mine: true, status }));
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/me${search}`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json(mockListResponse({ mine: true, status }));
  }

  const data = await res.json().catch(() => mockListResponse({ mine: true, status }));
  return NextResponse.json(data);
}
