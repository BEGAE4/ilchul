import { NextRequest, NextResponse } from 'next/server';
import type { Inquiry } from '@/features/inquiry/types/inquiry.types';

const MOCK_INQUIRIES: Inquiry[] = [
  {
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
  },
  {
    inquiryId: 2,
    userId: 'me',
    userNickname: '김여행',
    category: 'account',
    title: '닉네임 변경이 되지 않아요',
    content: '프로필 수정 화면에서 닉네임을 변경하고 저장 버튼을 눌러도 반영이 되지 않습니다.',
    status: 'answered',
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-05-11T14:00:00Z',
    answer: {
      answerId: 101,
      content:
        '안녕하세요! 일출 팀입니다. 닉네임 변경 오류를 확인하였으며, 현재 서버 점검을 통해 수정 완료하였습니다. 앱을 재시작 후 다시 시도해 주세요. 불편을 드려서 죄송합니다.',
      createdAt: '2026-05-11T14:00:00Z',
      adminName: '일출 운영팀',
    },
  },
];

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json({ inquiries: MOCK_INQUIRIES });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/inquiry`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ inquiries: MOCK_INQUIRIES });
  }

  const data = await res.json().catch(() => ({ inquiries: MOCK_INQUIRIES }));
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const body = await request.json().catch(() => ({}));

  if (!baseUrl) {
    const newInquiry: Inquiry = {
      inquiryId: Date.now(),
      userId: 'me',
      userNickname: '김여행',
      category: body.category ?? 'other',
      title: body.title ?? '',
      content: body.content ?? '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answer: null,
    };
    return NextResponse.json(newInquiry, { status: 201 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/inquiry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    const newInquiry: Inquiry = {
      inquiryId: Date.now(),
      userId: 'me',
      userNickname: '김여행',
      category: body.category ?? 'other',
      title: body.title ?? '',
      content: body.content ?? '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answer: null,
    };
    return NextResponse.json(newInquiry, { status: 201 });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: 201 });
}
