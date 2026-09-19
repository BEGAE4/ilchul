import {
  filterInquiriesByStatus,
  formatInquiryDate,
  toInquiryDetail,
  toInquiryListItem,
  toInquiryListResponse,
  toInquiryStatus,
} from './inquiryMapper';

describe('toInquiryStatus', () => {
  it('답변이 있으면 서버 상태와 무관하게 답변 완료', () => {
    expect(toInquiryStatus('OPEN', true)).toBe('ANSWERED');
    expect(toInquiryStatus('IN_PROGRESS', true)).toBe('ANSWERED');
  });

  it('처리·종료된 문의는 답변 여부와 무관하게 답변 완료', () => {
    expect(toInquiryStatus('RESOLVED', false)).toBe('ANSWERED');
    expect(toInquiryStatus('CLOSED', false)).toBe('ANSWERED');
  });

  it('그 외에는 답변 대기', () => {
    expect(toInquiryStatus('OPEN', false)).toBe('PENDING');
    expect(toInquiryStatus('IN_PROGRESS', false)).toBe('PENDING');
    expect(toInquiryStatus(undefined, undefined)).toBe('PENDING');
    expect(toInquiryStatus(null, null)).toBe('PENDING');
  });
});

describe('toInquiryListItem', () => {
  it('서버 아이템을 화면 아이템으로 옮긴다', () => {
    expect(
      toInquiryListItem({
        inquiryId: 7,
        title: '앱이 멈춰요',
        inquiryType: 'BUG',
        inquiryStatus: 'OPEN',
        hasAnswer: false,
        createdAt: '2026-09-19T10:00:00',
      })
    ).toEqual({
      inquiryId: 7,
      title: '앱이 멈춰요',
      categoryName: '버그',
      status: 'PENDING',
      hasAnswer: false,
      createdAt: '2026-09-19T10:00:00',
    });
  });

  it('관리자 목록의 작성자 닉네임은 있을 때만 싣는다', () => {
    expect(toInquiryListItem({ inquiryId: 1, authorNickname: '일출' })?.authorNickname).toBe('일출');
    expect(toInquiryListItem({ inquiryId: 1, authorNickname: null })).not.toHaveProperty(
      'authorNickname'
    );
  });

  it('빠지거나 null 인 필드는 기본값으로 채운다', () => {
    expect(
      toInquiryListItem({
        inquiryId: 3,
        title: null,
        inquiryType: null,
        inquiryStatus: null,
        hasAnswer: null,
        createdAt: null,
      })
    ).toEqual({
      inquiryId: 3,
      title: '(제목 없음)',
      categoryName: '기타',
      status: 'PENDING',
      hasAnswer: false,
      createdAt: '',
    });
  });

  it('모르는 문의 유형은 기타로 본다', () => {
    const raw = { inquiryId: 1, inquiryType: 'BILLING' } as unknown as Parameters<
      typeof toInquiryListItem
    >[0];
    expect(toInquiryListItem(raw)?.categoryName).toBe('기타');
  });

  it('ID 가 없는 항목은 버린다', () => {
    expect(toInquiryListItem({ title: '제목' })).toBeNull();
    expect(toInquiryListItem(null)).toBeNull();
    expect(toInquiryListItem(undefined)).toBeNull();
  });
});

describe('toInquiryListResponse', () => {
  it('items 가 없거나 배열이 아니어도 빈 목록을 돌려준다', () => {
    const empty = { items: [], nextCursorId: null, hasNext: false };
    expect(toInquiryListResponse(undefined)).toEqual(empty);
    expect(toInquiryListResponse(null)).toEqual(empty);
    expect(toInquiryListResponse({})).toEqual(empty);
    expect(toInquiryListResponse({ items: null })).toEqual(empty);
  });

  it('ID 없는 항목은 빼고 나머지를 옮긴다', () => {
    const res = toInquiryListResponse({
      items: [{ inquiryId: 2, title: 'a' }, { title: 'ID 없음' }, { inquiryId: 1, title: 'b' }],
      nextCursorId: 1,
      hasNext: true,
      totalCount: 12,
    });
    expect(res.items.map((i) => i.inquiryId)).toEqual([2, 1]);
    expect(res.nextCursorId).toBe(1);
    expect(res.hasNext).toBe(true);
    expect(res.totalCount).toBe(12);
  });

  it('커서 없이 hasNext 만 true 면 더 없다고 본다', () => {
    expect(toInquiryListResponse({ items: [], hasNext: true }).hasNext).toBe(false);
  });
});

describe('filterInquiriesByStatus', () => {
  it('탭 상태에 맞는 문의만 남긴다', () => {
    const items = toInquiryListResponse({
      items: [
        { inquiryId: 1, inquiryStatus: 'OPEN', hasAnswer: false },
        { inquiryId: 2, inquiryStatus: 'OPEN', hasAnswer: true },
        { inquiryId: 3, inquiryStatus: 'CLOSED', hasAnswer: false },
      ],
    }).items;
    expect(filterInquiriesByStatus(items, 'PENDING').map((i) => i.inquiryId)).toEqual([1]);
    expect(filterInquiriesByStatus(items, 'ANSWERED').map((i) => i.inquiryId)).toEqual([2, 3]);
  });
});

describe('toInquiryDetail', () => {
  it('목록과 같은 서버 필드명(inquiryStatus/inquiryType)으로 와도 읽는다', () => {
    const detail = toInquiryDetail({
      inquiryId: 5,
      title: '제안이 있어요',
      content: '본문',
      inquiryType: 'SUGGESTION',
      inquiryStatus: 'RESOLVED',
      images: [{ imageId: 1, imageUrl: 'https://img/1.png' }, { imageId: 2 }],
      createdAt: '2026-09-19T10:00:00',
      answer: {
        answerId: 9,
        content: '답변',
        answeredBy: '운영팀',
        answeredAt: '2026-09-20T10:00:00',
      },
    });
    expect(detail).toEqual({
      inquiryId: 5,
      title: '제안이 있어요',
      content: '본문',
      categoryId: 0,
      categoryName: '제안',
      inquiryType: 'SUGGESTION',
      status: 'ANSWERED',
      images: [{ imageId: 1, url: 'https://img/1.png' }],
      createdAt: '2026-09-19T10:00:00',
      updatedAt: '2026-09-19T10:00:00',
      answer: {
        answerId: 9,
        inquiryId: 5,
        content: '답변',
        answeredBy: '운영팀',
        answeredAt: '2026-09-20T10:00:00',
      },
    });
  });

  it('화면 필드명(status/categoryName)으로 와도 그대로 쓴다', () => {
    const detail = toInquiryDetail({
      inquiryId: 5,
      status: 'PENDING',
      categoryName: '일반 문의',
      inquiryType: 'GENERAL',
    });
    expect(detail?.status).toBe('PENDING');
    expect(detail?.categoryName).toBe('일반 문의');
    expect(detail?.images).toEqual([]);
    expect(detail?.answer).toBeNull();
  });

  it('상태 필드가 없어도 답변이 있으면 답변 완료', () => {
    expect(
      toInquiryDetail({ inquiryId: 5, inquiryStatus: 'OPEN', answer: { content: '답변' } })?.status
    ).toBe('ANSWERED');
  });

  it('문의로 볼 수 없는 응답은 null', () => {
    expect(toInquiryDetail({})).toBeNull();
    expect(toInquiryDetail(null)).toBeNull();
    expect(toInquiryDetail('not found')).toBeNull();
  });
});

describe('formatInquiryDate', () => {
  it('날짜와 시각을 형식에 맞춘다', () => {
    expect(formatInquiryDate('2026-09-05T07:03:00')).toBe('2026.09.05');
    expect(formatInquiryDate('2026-09-05T07:03:00', true)).toBe('2026.09.05 07:03');
  });

  it('없거나 깨진 날짜는 빈 문자열', () => {
    expect(formatInquiryDate('')).toBe('');
    expect(formatInquiryDate(null)).toBe('');
    expect(formatInquiryDate('어제')).toBe('');
  });
});
