import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

const EMPTY_PLANS_RESPONSE = { plans: [] };

// Next.js API 라우트는 프론트에서 호출하기 위한 프록시 역할만 합니다.
// 실제 데이터는 백엔드(`/api/mypage/plans`)에서 가져옵니다.
// 백엔드 에러를 mock 200으로 위장하지 않는다 (Architect C-1).
export async function GET(request: NextRequest) {
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/mypage/plans`, {
    method: 'GET',
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });

  // 204: 조회된 플랜 없음 → 빈 목록으로 정규화 (v6-002)
  if (res.status === 204) {
    return NextResponse.json(EMPTY_PLANS_RESPONSE);
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
