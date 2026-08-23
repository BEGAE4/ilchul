import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

// 신고 생성 — 백엔드 POST /api/report 프록시
export async function POST(request: NextRequest) {
  const baseUrl = getServerApiBaseUrl();
  const body = await request.json().catch(() => ({}));

  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const idemKey = request.headers.get('idempotency-key') ?? '';

  // try/catch 폴백 제거 — fetch 예외는 그대로 throw → Next가 500으로 전파 (Architect C-1)
  const res = await fetch(`${baseUrl}/api/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
      ...(idemKey ? { 'idempotency-key': idemKey } : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
