import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

const EMPTY_SCRAPPED_RESPONSE = { scrappedPlans: [] };

// 저장(스크랩)한 플랜 목록 조회 API (프론트 -> 백엔드 프록시)
// 백엔드 에러를 mock 200으로 위장하지 않는다 (Architect C-1).
export async function GET(request: NextRequest) {
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  // page/limit 등 목록 조회 조건은 그대로 넘긴다 (무한 스크롤, 백엔드가 페이징을 열면 바로 적용)
  const res = await fetch(`${baseUrl}/api/mypage/scrapped${request.nextUrl.search}`, {
    method: 'GET',
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });

  // 204: 스크랩한 플랜 없음 → 빈 목록으로 정규화
  if (res.status === 204) {
    return NextResponse.json(EMPTY_SCRAPPED_RESPONSE);
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
