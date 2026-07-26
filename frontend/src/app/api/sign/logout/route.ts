import { NextRequest, NextResponse } from 'next/server';

// 로그아웃 API (프론트 -> 백엔드 프록시) — 세션 쿠키 무효화, 204 No Content
export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';

    const res = await fetch(`${baseUrl}/api/sign/logout`, {
      method: 'POST',
      headers: cookie ? { cookie } : undefined,
      cache: 'no-store',
    });

    // 백엔드의 Set-Cookie(세션 만료)를 브라우저로 그대로 전달
    const response = new NextResponse(null, { status: res.status });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }
    return response;
  } catch (error) {
    console.error('로그아웃 실패 (백엔드 미연결):', error);
    return new NextResponse(null, { status: 204 });
  }
}
