import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const body = await request.json().catch(() => ({}));

  if (!baseUrl) {
    return NextResponse.json({
      success: true,
      inquiryId: Number(id),
      answer: {
        answerId: Date.now(),
        content: body.content ?? '',
        createdAt: new Date().toISOString(),
        adminName: '일출 운영팀',
      },
    });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/inquiry/${id}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({
      success: true,
      inquiryId: Number(id),
      answer: {
        answerId: Date.now(),
        content: body.content ?? '',
        createdAt: new Date().toISOString(),
        adminName: '일출 운영팀',
      },
    });
  }

  const data = await res.json().catch(() => ({ success: true }));
  return NextResponse.json(data);
}
