import { NextRequest, NextResponse } from 'next/server';
import { mockListResponse } from '../_mock';

/** GET 내 문의 목록 조회 (커서 페이징) — GET /api/cs-inquiry/my?size=&lastInquiryId= */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { search } = new URL(request.url);

  if (!baseUrl) {
    return NextResponse.json(mockListResponse({ mine: true }));
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/my${search}`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json(mockListResponse({ mine: true }));
  }

  const data = await res.json().catch(() => mockListResponse({ mine: true }));
  return NextResponse.json(data);
}
