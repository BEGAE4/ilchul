import { NextRequest, NextResponse } from 'next/server';
import type { RecentSearch } from '@/features/search/types/search.types';
import {
  getMockRecentSearches,
  addMockRecentSearch,
  clearMockRecentSearches,
} from './_mock';

/** GET 최근 검색기록 조회 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json(getMockRecentSearches());
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/recent`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json(getMockRecentSearches());
  }

  const data = await res.json().catch(() => getMockRecentSearches());
  return NextResponse.json(data);
}

/** POST 최근 검색기록 추가 */
export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const body = (await request.json().catch(() => null)) as RecentSearch | null;

  if (!baseUrl) {
    if (body?.name) addMockRecentSearch(body);
    return new NextResponse(null, { status: 201 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/recent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    if (body?.name) addMockRecentSearch(body);
    return new NextResponse(null, { status: 201 });
  }

  return new NextResponse(null, { status: res.status });
}

/** DELETE 최근 검색기록 전체 삭제 */
export async function DELETE(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    clearMockRecentSearches();
    return new NextResponse(null, { status: 204 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/recent`, {
    method: 'DELETE',
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    clearMockRecentSearches();
  }

  return new NextResponse(null, { status: 204 });
}
