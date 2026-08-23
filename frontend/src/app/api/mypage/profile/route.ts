import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

// 사용자 프로필 조회 — 백엔드 에러를 mock으로 위장하지 않는다 (Architect C-1)
export async function GET(request: NextRequest) {
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/mypage/profile`, {
    method: 'GET',
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

// 사용자 프로필 수정
export async function PATCH(request: NextRequest) {
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';
    const body = await request.json().catch(() => ({}));

    const res = await fetch(`${baseUrl}/api/mypage/profile`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // 202: 응답 성공 boolean:true
    return NextResponse.json(data, { status: 202 });
  } catch (error) {
    console.error('사용자 프로필 수정 실패:', error);
    return NextResponse.json(
      { error: '사용자 프로필 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}
