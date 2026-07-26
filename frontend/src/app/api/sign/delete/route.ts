import { NextRequest, NextResponse } from 'next/server';

// 회원 탈퇴 API (프론트 -> 백엔드 프록시) — 계정 영구 삭제 후 세션 만료
export async function DELETE(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return new NextResponse(null, { status: 200 });
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';

    const res = await fetch(`${baseUrl}/api/sign/delete`, {
      method: 'DELETE',
      headers: cookie ? { cookie } : undefined,
      cache: 'no-store',
    });

    // 탈퇴 후 백엔드의 Set-Cookie(세션 만료)를 브라우저로 그대로 전달
    const response = new NextResponse(null, { status: res.status });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }
    return response;
  } catch (error) {
    console.error('회원 탈퇴 실패 (백엔드 미연결):', error);
    return new NextResponse(null, { status: 200 });
  }
}
