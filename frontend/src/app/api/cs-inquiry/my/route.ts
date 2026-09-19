import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET 내 문의 목록 조회 — 백엔드 GET /api/cs-inquiry/my 프록시 (?size=&lastInquiryId=)
 * 정적 세그먼트(my)가 동적 세그먼트([id])보다 먼저 매칭되므로 [id] 라우트에 가려지지 않는다.
 */
export async function GET(request: NextRequest) {
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const { search } = new URL(request.url);
  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/my${search}`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
