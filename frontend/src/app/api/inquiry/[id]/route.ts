import { NextRequest, NextResponse } from 'next/server';
import type { Inquiry } from '@/features/inquiry/types/inquiry.types';

const MOCK_DETAIL: Inquiry = {
  inquiryId: 1,
  userId: 'me',
  userNickname: '김여행',
  category: 'bug',
  title: '앱 실행 시 화면이 멈춥니다',
  content: '홈 화면에서 코스 탭을 누르면 앱이 멈추는 현상이 발생합니다. 재현 경로: 홈 > 코스 탭 터치 > 3초 대기 후 화면 정지.',
  status: 'pending',
  createdAt: '2026-05-14T10:30:00Z',
  updatedAt: '2026-05-14T10:30:00Z',
  answer: null,
};

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({ ...MOCK_DETAIL, inquiryId: Number(id) });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/inquiry/${id}`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ ...MOCK_DETAIL, inquiryId: Number(id) });
  }

  const data = await res.json().catch(() => ({ ...MOCK_DETAIL, inquiryId: Number(id) }));
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const body = await request.json().catch(() => ({}));

  if (!baseUrl) {
    return NextResponse.json({ ...MOCK_DETAIL, inquiryId: Number(id), ...body, updatedAt: new Date().toISOString() });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/inquiry/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ ...MOCK_DETAIL, inquiryId: Number(id), ...body, updatedAt: new Date().toISOString() });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({ success: true, inquiryId: Number(id) });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/inquiry/${id}`, {
    method: 'DELETE',
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ success: true, inquiryId: Number(id) });
  }

  return NextResponse.json({ success: true });
}
