import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string; imageId: string }> };

/**
 * GET 문의 첨부 이미지 — 백엔드 프록시.
 * 첨부는 공개 저장소가 아니라 작성자·관리자만 받을 수 있는 API 로 내려온다(상세 응답의 imageUrl 이 이 경로).
 * 운영은 BFF 를 거치지 않으므로 경로가 백엔드와 같아야 한다. 바이트와 Content-Type 을 그대로 넘긴다.
 */
export async function GET(request: NextRequest, { params }: Params) {
  const { id, imageId } = await params;
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';
    const res = await fetch(`${baseUrl}/api/cs-inquiry/${id}/images/${imageId}`, {
      headers: cookie ? { cookie } : undefined,
      cache: 'no-store',
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    }

    const headers = new Headers({
      'Content-Type': res.headers.get('content-type') ?? 'application/octet-stream',
      // 비공개 첨부다 — 공유 캐시에 남기지 않는다
      'Cache-Control': 'private, no-store',
    });
    const disposition = res.headers.get('content-disposition');
    if (disposition) headers.set('Content-Disposition', disposition);
    return new NextResponse(res.body, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: 'upstream_unavailable' }, { status: 502 });
  }
}
