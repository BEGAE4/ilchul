import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const MOCK_PROFILE = {
  userNickname: '김여행',
  userImg: 'https://i.pravatar.cc/150?u=me',
  userIntro: '힐링 여행을 좋아하는 여행자입니다 🌿',
};

// 사용자 프로필 조회
export async function GET(request: NextRequest) {
  const baseUrl = BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(MOCK_PROFILE);
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';

    const res = await fetch(`${baseUrl}/api/mypage/profile`, {
      method: 'GET',
      headers: cookie ? { cookie } : undefined,
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.warn(`프로필 조회: 백엔드 응답 ${res.status}, mock 반환`);
      return NextResponse.json(MOCK_PROFILE);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('사용자 프로필 조회 실패 (백엔드 미연결, mock 반환):', error);
    return NextResponse.json(MOCK_PROFILE);
  }
}

// 사용자 프로필 수정
export async function PATCH(request: NextRequest) {
  const baseUrl = BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_API_BASE_URL 설정이 필요합니다.' },
      { status: 500 }
    );
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

