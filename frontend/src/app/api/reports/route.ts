import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const body = await request.json();

  // dev only: baseUrl 미설정 시 mock 반환
  if (!baseUrl) {
    if (process.env.NODE_ENV === 'production') {
      // 프로덕션에서 baseUrl이 비어 있으면 설정 실수 — 502로 표면화 (Architect C-1)
      return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
    }
    return NextResponse.json(
      { reportId: `mock-${Date.now()}`, status: 'PENDING', alreadyReported: false },
      { status: 201 }
    );
  }

  const cookie = request.headers.get('cookie') ?? '';
  const idemKey = request.headers.get('idempotency-key') ?? '';

  // try/catch 폴백 제거 — fetch 예외는 그대로 throw → Next가 500으로 전파 (Architect C-1)
  const res = await fetch(`${baseUrl}/api/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
      ...(idemKey ? { 'idempotency-key': idemKey } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
