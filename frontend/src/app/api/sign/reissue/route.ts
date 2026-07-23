import { NextRequest, NextResponse } from 'next/server';

// 토큰 재발급 API (프론트 -> 백엔드 프록시) — 리프레시 토큰으로 액세스 토큰 재발급
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return new NextResponse(null, { status: 401 });
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';

    const res = await fetch(`${baseUrl}/api/sign/reissue`, {
      method: 'GET',
      headers: cookie ? { cookie } : undefined,
      cache: 'no-store',
    });

    // 재발급된 액세스 토큰(문자열)을 그대로 전달
    const body = await res.text();
    const response = new NextResponse(body, { status: res.status });

    // 백엔드가 갱신 토큰을 쿠키로 내려주는 경우 브라우저로 그대로 전달
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }
    return response;
  } catch (error) {
    console.error('토큰 재발급 실패 (백엔드 미연결):', error);
    return new NextResponse(null, { status: 401 });
  }
}
