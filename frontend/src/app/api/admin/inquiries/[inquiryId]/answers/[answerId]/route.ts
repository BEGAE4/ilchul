import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ inquiryId: string; answerId: string }>;
}

// 답변 수정/삭제 — 백엔드 프록시 (명세에 없는 엔드포인트, upstream status 그대로 전파)
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { inquiryId, answerId } = await ctx.params;
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const body = await req.json().catch(() => ({}));
  const cookie = req.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/admin/inquiries/${inquiryId}/answers/${answerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { inquiryId, answerId } = await ctx.params;
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const cookie = req.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/admin/inquiries/${inquiryId}/answers/${answerId}`, {
    method: 'DELETE',
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
