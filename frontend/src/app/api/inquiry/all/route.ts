import { NextRequest, NextResponse } from 'next/server';
import type { Inquiry } from '@/features/inquiry/types/inquiry.types';

const MOCK_ALL_INQUIRIES: Inquiry[] = [
  {
    inquiryId: 1,
    userId: 'me',
    userNickname: '김여행',
    category: 'bug',
    title: '앱 실행 시 화면이 멈춥니다',
    content: '홈 화면에서 코스 탭을 누르면 앱이 멈추는 현상이 발생합니다.',
    status: 'pending',
    createdAt: '2026-05-14T10:30:00Z',
    updatedAt: '2026-05-14T10:30:00Z',
    answer: null,
  },
  {
    inquiryId: 2,
    userId: 'user_01',
    userNickname: '이하늘',
    category: 'account',
    title: '닉네임 변경이 되지 않아요',
    content: '프로필 수정 화면에서 닉네임을 변경하고 저장 버튼을 눌러도 반영이 되지 않습니다.',
    status: 'answered',
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-05-11T14:00:00Z',
    answer: {
      answerId: 101,
      content: '닉네임 변경 오류를 수정 완료하였습니다. 앱을 재시작 후 다시 시도해 주세요.',
      createdAt: '2026-05-11T14:00:00Z',
      adminName: '일출 운영팀',
    },
  },
  {
    inquiryId: 3,
    userId: 'user_02',
    userNickname: '박바다',
    category: 'feature',
    title: '코스 공유 기능이 있었으면 좋겠어요',
    content: '친구에게 내가 만든 힐링 코스를 SNS로 공유하는 기능을 추가해 주세요.',
    status: 'pending',
    createdAt: '2026-05-15T08:00:00Z',
    updatedAt: '2026-05-15T08:00:00Z',
    answer: null,
  },
  {
    inquiryId: 4,
    userId: 'user_03',
    userNickname: '최봄',
    category: 'content',
    title: '특정 장소 정보가 잘못되었어요',
    content: '제주 협재 해수욕장 정보에 운영시간이 잘못 표기되어 있습니다.',
    status: 'pending',
    createdAt: '2026-05-16T07:20:00Z',
    updatedAt: '2026-05-16T07:20:00Z',
    answer: null,
  },
];

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({ inquiries: MOCK_ALL_INQUIRIES });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const res = await fetch(`${baseUrl}/api/inquiry/all`, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ inquiries: MOCK_ALL_INQUIRIES });
  }

  const data = await res.json().catch(() => ({ inquiries: MOCK_ALL_INQUIRIES }));
  return NextResponse.json(data);
}
