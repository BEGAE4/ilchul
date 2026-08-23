import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

// 관리자 신고 목록 — 백엔드 GET /api/admin/reports 프록시
export async function GET(req: NextRequest) {
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const { search } = new URL(req.url);
  const cookie = req.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/admin/reports${search}`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
