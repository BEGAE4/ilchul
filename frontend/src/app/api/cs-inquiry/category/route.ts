import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

/** GET 문의 카테고리(타입) 목록 조회 — 백엔드 GET /api/cs-inquiry/category 프록시 */
export async function GET(request: NextRequest) {
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/category`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
