import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

// 지역 메타 — 시/도 목록·별칭·장소 수·시군구 (백엔드 프록시, 2026-09-29 추가)
export async function GET(request: NextRequest) {
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }
  try {
    const cookie = request.headers.get('cookie') ?? '';
    const res = await fetch(`${baseUrl}/api/region`, {
      method: 'GET',
      headers: cookie ? { cookie } : undefined,
      // 지역 목록은 자주 바뀌지 않는다 — 5분 캐시
      next: { revalidate: 300 },
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
