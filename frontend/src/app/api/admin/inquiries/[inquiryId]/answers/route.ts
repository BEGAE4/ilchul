import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ inquiryId: string }>;
}

// 관리자 문의 답변 작성 — 백엔드 POST /api/cs-inquiry/{inquiryId}/reply 프록시
export async function POST(req: NextRequest, ctx: RouteContext) {
  const { inquiryId } = await ctx.params;
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const body = await req.json().catch(() => ({}));
  const cookie = req.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/${inquiryId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
