import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ reportId: string }>;
}

// 신고 상세 조회 — 백엔드 GET /api/admin/reports/{reportId} 프록시
export async function GET(req: NextRequest, ctx: RouteContext) {
  const { reportId } = await ctx.params;
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const cookie = req.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/admin/reports/${reportId}`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

// 신고 상태 변경 — 백엔드 PATCH /api/admin/reports/{reportId} 프록시
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { reportId } = await ctx.params;
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const body = await req.json().catch(() => ({}));
  const cookie = req.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/admin/reports/${reportId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
