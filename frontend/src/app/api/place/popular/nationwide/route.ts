import { NextRequest, NextResponse } from 'next/server';
import { buildMockNationwidePlaces } from '@/features/main/utils/popular-mock';

// MAIN-60. 전국 인기 장소 — 백엔드 프록시, 실패 시 mock 폴백
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const limit = Number(sp.get('limit') ?? 6);
  const page = Number(sp.get('page') ?? 1);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(buildMockNationwidePlaces(limit, page));
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';
    const url = new URL(`${baseUrl}/api/place/popular/nationwide`);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('page', String(page));

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: cookie ? { cookie } : undefined,
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      console.warn(`전국 인기 장소 조회: 백엔드 응답 ${res.status}, mock 반환`);
      return NextResponse.json(buildMockNationwidePlaces(limit, page));
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('전국 인기 장소 조회 실패 (백엔드 미연결, mock 반환):', error);
    return NextResponse.json(buildMockNationwidePlaces(limit, page));
  }
}
