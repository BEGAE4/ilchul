import { NextRequest, NextResponse } from 'next/server';
import type {
  InquiryAnswer,
  InquiryDetail,
  InquiryType,
} from '@/features/inquiry/types/inquiry.types';
import { mockDetail } from '../_mock';

type Params = { params: Promise<{ id: string }> };

/** GET 문의 상세 조회 */
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json(mockDetail(Number(id)));
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/${id}`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json(mockDetail(Number(id)));
  }

  const data = await res.json().catch(() => mockDetail(Number(id)));
  return NextResponse.json(data);
}

/** PATCH 문의 수정 — multipart/form-data */
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const formData = await request.formData().catch(() => null);

  if (!baseUrl) {
    const base = mockDetail(Number(id));
    const updated: InquiryDetail = {
      ...base,
      title: (formData?.get('title') as string) ?? base.title,
      content: (formData?.get('content') as string) ?? base.content,
      categoryId: formData?.get('categoryId')
        ? Number(formData.get('categoryId'))
        : base.categoryId,
      inquiryType: (formData?.get('inquiryType') as InquiryType) ?? base.inquiryType,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(updated);
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/${id}`, {
    method: 'PATCH',
    headers: cookie ? { cookie } : undefined,
    body: formData ?? undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    // 백엔드 미동작 시 mock 으로 폴백
    const base = mockDetail(Number(id));
    return NextResponse.json({
      ...base,
      title: (formData?.get('title') as string) ?? base.title,
      content: (formData?.get('content') as string) ?? base.content,
      categoryId: formData?.get('categoryId')
        ? Number(formData.get('categoryId'))
        : base.categoryId,
      inquiryType: (formData?.get('inquiryType') as InquiryType) ?? base.inquiryType,
      updatedAt: new Date().toISOString(),
    });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

/** DELETE 문의 삭제 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({ success: true, inquiryId: Number(id) });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/${id}`, {
    method: 'DELETE',
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    // 백엔드 미동작 시 mock 으로 폴백
    return NextResponse.json({ success: true, inquiryId: Number(id) });
  }

  return NextResponse.json({ success: true });
}

/** POST 문의 답변 작성 (관리자) — { content } */
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const body = await request.json().catch(() => ({}));

  if (!baseUrl) {
    const answer: InquiryAnswer = {
      answerId: Date.now(),
      inquiryId: Number(id),
      content: body.content ?? '',
      answeredBy: '관리자',
      answeredAt: new Date().toISOString(),
    };
    return NextResponse.json(answer, { status: 201 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/cs-inquiry/${id}`, {
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
    const answer: InquiryAnswer = {
      answerId: Date.now(),
      inquiryId: Number(id),
      content: body.content ?? '',
      answeredBy: '관리자',
      answeredAt: new Date().toISOString(),
    };
    return NextResponse.json(answer, { status: 201 });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
