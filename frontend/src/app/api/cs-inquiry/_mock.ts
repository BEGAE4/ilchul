import type {
  InquiryDetail,
  InquiryListItem,
  InquiryStatus,
  InquiryType,
} from '@/features/inquiry/types/inquiry.types';
import { INQUIRY_TYPE_LABELS } from '@/features/inquiry/types/inquiry.types';

/**
 * BFF mock 데이터 (NEXT_PUBLIC_API_BASE_URL 미설정/요청 실패 시 사용).
 * 상세 객체를 단일 소스로 두고 목록 아이템은 여기서 파생한다.
 */
export const MOCK_DETAILS: InquiryDetail[] = [
  {
    inquiryId: 1,
    title: '앱 실행 시 화면이 멈춥니다',
    content:
      '홈 화면에서 코스 탭을 누르면 앱이 멈추는 현상이 발생합니다. 재현 경로: 홈 > 코스 탭 터치 > 3초 대기 후 화면 정지.',
    categoryId: 2,
    categoryName: '버그',
    inquiryType: 'BUG',
    status: 'PENDING',
    images: [
      { imageId: 11, url: 'https://picsum.photos/seed/inq11/400/300' },
    ],
    authorNickname: '김여행',
    createdAt: '2026-05-14T10:30:00',
    updatedAt: '2026-05-14T10:30:00',
    answer: null,
  },
  {
    inquiryId: 2,
    title: '닉네임 변경이 되지 않아요',
    content:
      '프로필 수정 화면에서 닉네임을 변경하고 저장 버튼을 눌러도 반영이 되지 않습니다.',
    categoryId: 1,
    categoryName: '일반',
    inquiryType: 'GENERAL',
    status: 'ANSWERED',
    images: [],
    authorNickname: '김여행',
    createdAt: '2026-05-10T09:00:00',
    updatedAt: '2026-05-11T14:00:00',
    answer: {
      answerId: 101,
      inquiryId: 2,
      content:
        '안녕하세요! 일출 팀입니다. 닉네임 변경 오류를 확인하였으며, 현재 서버 점검을 통해 수정 완료하였습니다. 앱을 재시작 후 다시 시도해 주세요. 불편을 드려 죄송합니다.',
      answeredBy: '일출 운영팀',
      answeredAt: '2026-05-11T14:00:00',
    },
  },
  {
    inquiryId: 3,
    title: '코스 공유 기능이 있었으면 좋겠어요',
    content: '친구에게 내가 만든 힐링 코스를 SNS로 공유하는 기능을 추가해 주세요.',
    categoryId: 3,
    categoryName: '제안',
    inquiryType: 'SUGGESTION',
    status: 'PENDING',
    images: [],
    authorNickname: '박바다',
    createdAt: '2026-05-15T08:00:00',
    updatedAt: '2026-05-15T08:00:00',
    answer: null,
  },
  {
    inquiryId: 4,
    title: '특정 장소 정보가 잘못되었어요',
    content: '제주 협재 해수욕장 정보에 운영시간이 잘못 표기되어 있습니다.',
    categoryId: 4,
    categoryName: '기타',
    inquiryType: 'OTHER',
    status: 'PENDING',
    images: [],
    authorNickname: '최봄',
    createdAt: '2026-05-16T07:20:00',
    updatedAt: '2026-05-16T07:20:00',
    answer: null,
  },
];

/** 내 문의 mock (작성자 본인 = 김여행 으로 가정) */
const MY_NICKNAME = '김여행';

export function toListItem(d: InquiryDetail, withAuthor: boolean): InquiryListItem {
  return {
    inquiryId: d.inquiryId,
    title: d.title,
    categoryName: d.categoryName,
    status: d.status,
    hasAnswer: d.answer !== null,
    ...(withAuthor ? { authorNickname: d.authorNickname } : {}),
    createdAt: d.createdAt,
  };
}

export function mockListResponse(
  opts: { mine?: boolean; status?: InquiryStatus | null } = {}
) {
  let source = MOCK_DETAILS;
  if (opts.mine) {
    source = source.filter((d) => d.authorNickname === MY_NICKNAME);
  }
  if (opts.status) {
    source = source.filter((d) => d.status === opts.status);
  }
  const items = source.map((d) => toListItem(d, !opts.mine));
  return {
    items,
    nextCursorId: null,
    hasNext: false,
    ...(opts.mine ? {} : { totalCount: items.length }),
  };
}

/** 작성 요청(FormData) 기반 mock 생성 결과 */
export function mockCreated(formData: FormData | null): InquiryDetail {
  const now = new Date().toISOString();
  const inquiryType = ((formData?.get('inquiryType') as InquiryType) ?? 'GENERAL') as InquiryType;
  const images = (formData?.getAll('images') ?? [])
    .filter((f): f is File => f instanceof File)
    .map((_, idx) => ({
      imageId: Date.now() + idx,
      url: `https://picsum.photos/seed/new${Date.now() + idx}/400/300`,
    }));

  return {
    inquiryId: Date.now(),
    title: (formData?.get('title') as string) ?? '',
    content: (formData?.get('content') as string) ?? '',
    categoryId: Number(formData?.get('categoryId') ?? 1),
    categoryName: INQUIRY_TYPE_LABELS[inquiryType] ?? '일반',
    inquiryType,
    status: 'PENDING',
    images,
    authorNickname: MY_NICKNAME,
    createdAt: now,
    updatedAt: now,
    answer: null,
  };
}

export function mockDetail(id: number): InquiryDetail {
  const found = MOCK_DETAILS.find((d) => d.inquiryId === id);
  if (found) return found;
  // 새로 작성된(타임스탬프 id) 항목 등 미존재 시 첫 항목 기반 placeholder
  return { ...MOCK_DETAILS[0], inquiryId: id };
}
