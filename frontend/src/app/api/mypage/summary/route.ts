import { NextRequest, NextResponse } from 'next/server';

const MOCK_SUMMARY = {
  publicPlanCount: 0,
  verifyPlanCount: 0,
  scrappedByOthersCount: 0,
  savedCourseCount: 0,
};

// 사용자 프로필 COUNT 조회 API (프론트 -> 백엔드 프록시)
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(MOCK_SUMMARY);
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';

    const res = await fetch(`${baseUrl}/api/mypage/summary`, {
      method: 'GET',
      headers: cookie ? { cookie } : undefined,
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.warn(`마이페이지 요약 조회: 백엔드 응답 ${res.status}, mock 반환`);
      return NextResponse.json(MOCK_SUMMARY);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('마이페이지 요약 정보 조회 실패 (백엔드 미연결, mock 반환):', error);
    return NextResponse.json(MOCK_SUMMARY);
  }
}

