import { NextRequest, NextResponse } from 'next/server';
import { buildMockNearbyPlaces } from '@/features/main/utils/popular-mock';

// MAIN-61. 내 주변 인기 장소 — 백엔드 프록시, 실패 시 mock 폴백
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const lat = sp.get('lat');
  const lng = sp.get('lng');
  const limit = Number(sp.get('limit') ?? 5);
  const page = Number(sp.get('page') ?? 1);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(buildMockNearbyPlaces(limit, page));
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';
    const url = new URL(`${baseUrl}/api/place/popular`);
    if (lat) url.searchParams.set('lat', lat);
    if (lng) url.searchParams.set('lng', lng);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('page', String(page));

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: cookie ? { cookie } : undefined,
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      console.warn(`내 주변 인기 장소 조회: 백엔드 응답 ${res.status}, mock 반환`);
      return NextResponse.json(buildMockNearbyPlaces(limit, page));
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('내 주변 인기 장소 조회 실패 (백엔드 미연결, mock 반환):', error);
    return NextResponse.json(buildMockNearbyPlaces(limit, page));
  }
}
