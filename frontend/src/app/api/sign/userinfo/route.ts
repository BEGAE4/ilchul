import { NextRequest, NextResponse } from 'next/server';

const MOCK_USER_INFO = {
  role: [{ authority: 'ROLE_USER' }],
  email: 'test@ilchul.com',
};

// 로그인 여부 확인 API (프론트 -> 백엔드 프록시) — 200: 로그인 상태, 401: 미로그인
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(MOCK_USER_INFO);
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';

    const res = await fetch(`${baseUrl}/api/sign/userinfo`, {
      method: 'GET',
      headers: cookie ? { cookie } : undefined,
      cache: 'no-store',
    });

    if (res.status === 401) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.warn(`사용자 정보 조회: 백엔드 응답 ${res.status}, mock 반환`);
      return NextResponse.json(MOCK_USER_INFO);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('사용자 정보 조회 실패 (백엔드 미연결, mock 반환):', error);
    return NextResponse.json(MOCK_USER_INFO);
  }
}
