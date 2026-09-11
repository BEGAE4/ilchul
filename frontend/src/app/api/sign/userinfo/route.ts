import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

const MOCK_USER_INFO = {
  role: [{ authority: 'ROLE_USER' }],
  email: 'test@ilchul.com',
};

// 로그인 여부 확인 API (프론트 -> 백엔드 프록시) — 200: 로그인 상태, 401: 미로그인
// 백엔드 에러를 mock 200으로 위장하지 않는다 (로그인 상태 오판 방지, Architect C-1)
export async function GET(request: NextRequest) {
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    // dev 편의: 백엔드 미설정 시에만 mock. production은 설정 실수 → 502로 표면화
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
    }
    return NextResponse.json(MOCK_USER_INFO);
  }

  const cookie = request.headers.get('cookie') ?? '';

  // fetch 예외는 그대로 throw → Next 500 → useAuth가 미로그인으로 안전 폴백
  const res = await fetch(`${baseUrl}/api/sign/userinfo`, {
    method: 'GET',
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });

  if (res.status === 401) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
