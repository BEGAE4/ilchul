import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

/** PATCH 문의 종료(완료) — 작성자, PATCH /api/cs-inquiry/{id}/close */
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({ success: true, inquiryId: Number(id) });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/${id}/close`, {
    method: 'PATCH',
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ success: true, inquiryId: Number(id) });
  }

  return NextResponse.json({ success: true });
}
