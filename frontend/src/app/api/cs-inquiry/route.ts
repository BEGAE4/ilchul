import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET 문의 목록 조회 — 백엔드 GET /api/cs-inquiry 프록시
 * - 내 문의:   ?size=&lastInquiryId=&status=
 * - 전체(관리자): ?category=&search=&status=&lastInquiryId=
 * 범위는 백엔드 인증 역할로 결정된다.
 */
export async function GET(request: NextRequest) {
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const { search } = new URL(request.url);
  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry${search}`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

/** POST 문의 작성 — multipart/form-data */
export async function POST(request: NextRequest) {
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const formData = await request.formData().catch(() => null);
  const cookie = request.headers.get('cookie') ?? '';
  // FormData를 그대로 포워딩 — Content-Type은 fetch가 boundary와 함께 자동 설정
  const res = await fetch(`${baseUrl}/api/cs-inquiry`, {
    method: 'POST',
    headers: cookie ? { cookie } : undefined,
    body: formData ?? undefined,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
