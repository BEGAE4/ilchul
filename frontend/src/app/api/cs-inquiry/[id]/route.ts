import { getServerApiBaseUrl } from '@/shared/lib/api/serverApiBaseUrl';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

/** GET 문의 상세 조회 — 백엔드 프록시. 백엔드에 아직 없는 엔드포인트라 지금은 upstream 오류(404/405)가 그대로 전달된다 */
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/${id}`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

/** PATCH 문의 수정 — multipart/form-data */
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const formData = await request.formData().catch(() => null);
  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/${id}`, {
    method: 'PATCH',
    headers: cookie ? { cookie } : undefined,
    body: formData ?? undefined,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

/** DELETE 문의 삭제 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/${id}`, {
    method: 'DELETE',
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

// 답변 작성(POST)은 명세 경로와 같은 ./reply/route.ts 에 있다 — 운영은 BFF 를 거치지 않아 경로가 백엔드와 같아야 한다
