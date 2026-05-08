import { NextRequest, NextResponse } from 'next/server';

const MOCK_PLANS_RESPONSE = { plans: [] };

// Next.js API 라우트는 프론트에서 호출하기 위한 프록시 역할만 합니다.
// 실제 데이터는 백엔드(`/api/mypage/plans`)에서 가져옵니다.
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(MOCK_PLANS_RESPONSE);
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';

    const res = await fetch(`${baseUrl}/api/mypage/plans`, {
      method: 'GET',
      headers: cookie ? { cookie } : undefined,
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.warn(`플랜 목록 조회: 백엔드 응답 ${res.status}, mock 반환`);
      return NextResponse.json(MOCK_PLANS_RESPONSE);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('플랜 목록 조회 실패 (백엔드 미연결, mock 반환):', error);
    return NextResponse.json(MOCK_PLANS_RESPONSE);
  }
}

