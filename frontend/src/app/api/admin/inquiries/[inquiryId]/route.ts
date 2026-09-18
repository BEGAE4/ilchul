import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ inquiryId: string }>;
}

// 관리자 문의 상세/상태 변경 — 백엔드 프록시 (upstream status 그대로 전파)
export async function GET(req: NextRequest, ctx: RouteContext) {
  const { inquiryId } = await ctx.params;
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const cookie = req.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/admin/inquiries/${inquiryId}`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { inquiryId } = await ctx.params;
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const body = await req.json().catch(() => ({}));
  const cookie = req.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/admin/inquiries/${inquiryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
