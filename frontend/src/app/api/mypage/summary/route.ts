import { NextRequest, NextResponse } from 'next/server';

const MOCK_SUMMARY = {
  publicPlanCount: 0,
  verifyPlanCount: 0,
  scrappedByOthersCount: 0,
  savedCourseCount: 0,
};

// 사용자 프로필 COUNT 조회 API (프론트 -> 백엔드 프록시)
// 백엔드 에러를 mock 200으로 위장하지 않는다 (Architect C-1).
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
    }
    return NextResponse.json(MOCK_SUMMARY);
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/mypage/summary`, {
    method: 'GET',
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
