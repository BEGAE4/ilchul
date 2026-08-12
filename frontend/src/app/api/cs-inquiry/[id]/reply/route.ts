import { NextRequest, NextResponse } from 'next/server';
import type { InquiryAnswer } from '@/features/inquiry/types/inquiry.types';

type Params = { params: Promise<{ id: string }> };

/** POST 문의 답변 작성 (관리자) — POST /api/cs-inquiry/{id}/reply, body { content } */
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const body = await request.json().catch(() => ({}));

  const mockAnswer = (): InquiryAnswer => ({
    answerId: Date.now(),
    inquiryId: Number(id),
    content: body.content ?? '',
    answeredBy: '관리자',
    answeredAt: new Date().toISOString(),
  });

  if (!baseUrl) {
    return NextResponse.json(mockAnswer(), { status: 201 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/${id}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    // 백엔드 미동작 시 mock 으로 폴백
    return NextResponse.json(mockAnswer(), { status: 201 });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
