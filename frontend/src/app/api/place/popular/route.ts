import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

// MAIN-61. 내 주변 인기 장소 — 백엔드 프록시
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  // 주변 목록은 지역명으로 조회한다. 좌표는 예전 호출과의 호환을 위해 오면 그대로 넘긴다.
  const region = sp.get('region');
  const lat = sp.get('lat');
  const lng = sp.get('lng');
  const limit = Number(sp.get('limit') ?? 5);
  const page = Number(sp.get('page') ?? 1);

  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';
    const url = new URL(`${baseUrl}/api/place/popular`);
    if (region) url.searchParams.set('region', region);
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
      return NextResponse.json({ error: 'upstream_error', status: res.status }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'upstream_unavailable' }, { status: 502 });
  }
}
