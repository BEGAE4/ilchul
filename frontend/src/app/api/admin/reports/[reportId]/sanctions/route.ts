import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ reportId: string }>;
}

// 신고 제재 등록 — 백엔드 POST /api/admin/reports/{reportId}/sanctions 프록시
export async function POST(req: NextRequest, ctx: RouteContext) {
  const { reportId } = await ctx.params;
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const body = await req.json().catch(() => ({}));
  const cookie = req.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/admin/reports/${reportId}/sanctions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
