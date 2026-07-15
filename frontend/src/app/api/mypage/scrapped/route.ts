import { NextRequest, NextResponse } from 'next/server';

const MOCK_SCRAPPED_RESPONSE = { scrappedPlans: [] };

// 저장(스크랩)한 플랜 목록 조회 API (프론트 -> 백엔드 프록시)
// 실제 데이터는 백엔드(`/api/mypage/scrapped`)에서 가져옵니다.
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(MOCK_SCRAPPED_RESPONSE);
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';

    const res = await fetch(`${baseUrl}/api/mypage/scrapped`, {
      method: 'GET',
      headers: cookie ? { cookie } : undefined,
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.warn(`저장한 플랜 조회: 백엔드 응답 ${res.status}, mock 반환`);
      return NextResponse.json(MOCK_SCRAPPED_RESPONSE);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('저장한 플랜 조회 실패 (백엔드 미연결, mock 반환):', error);
    return NextResponse.json(MOCK_SCRAPPED_RESPONSE);
  }
}
