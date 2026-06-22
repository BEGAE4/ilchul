import { NextRequest, NextResponse } from 'next/server';
import { buildMockNationwidePlaces } from '@/features/main/utils/popular-mock';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// MAIN-60. 전국 인기 장소 — 백엔드 프록시
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const limit = Number(sp.get('limit') ?? 6);
  const page = Number(sp.get('page') ?? 1);

  if (USE_MOCK || !BASE_URL) {
    return NextResponse.json(buildMockNationwidePlaces(limit, page));
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';
    const url = new URL(`${BASE_URL}/api/place/popular/nationwide`);
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
