import { normalizePlanDetail } from './normalizePlanDetail';
import type { PlanDetail, PlanPlaceDetail } from '../types/plan.types';

function place(overrides: Partial<PlanPlaceDetail> = {}): PlanPlaceDetail {
  return {
    planPlaceId: 1,
    placeId: 10,
    placeImage: '',
    placeName: '장소',
    categoryName: '카페',
    address: '서울 중구 세종대로 2',
    roadAddress: '',
    orderIndex: 1,
    visitTime: '',
    stayDescription: '',
    isStamped: false,
    travelTime: 0,
    stayTime: 60,
    ...overrides,
  };
}

function plan(overrides: Partial<PlanDetail> = {}): PlanDetail {
  return {
    planId: 33,
    planTitle: '지친 홍정표님을 위한 힐링 플랜',
    tripStartDate: '2026-09-02 10:00',
    tripEndDate: '2026-09-02 18:00',
    createAt: '2026-09-02 09:00',
    planVerified: false,
    isPlanVisible: false,
    isBookmarked: false,
    isLiked: false,
    requiredTime: 0,
    totalDistance: 0,
    planDescription: '',
    likeCount: 0,
    bookmarkCount: 0,
    userId: 1,
    userNickname: '홍정표',
    userAvatar: '',
    planImageUrls: [],
    tags: [],
    thumbnailUrl: '',
    planPlaceDetailDtos: [],
    ...overrides,
  };
}

describe('normalizePlanDetail', () => {
  it('null 로 오는 배열 필드를 빈 배열로 만든다', () => {
    const raw = plan({
      tags: null as unknown as string[],
      planImageUrls: null as unknown as string[],
      planPlaceDetailDtos: null as unknown as PlanPlaceDetail[],
    });
    const out = normalizePlanDetail(raw);
    expect(out.tags).toEqual([]);
    expect(out.planImageUrls).toEqual([]);
    expect(out.planPlaceDetailDtos).toEqual([]);
  });

  it('같은 planPlaceId 가 반복되면 첫 항목만 남긴다 (이미지 N장 × 장소 M개 조인 중복, C-01)', () => {
    const raw = plan({
      planImageUrls: ['https://cdn/a.jpg', 'https://cdn/b.jpg'],
      planPlaceDetailDtos: [
        place({ planPlaceId: 1, orderIndex: 1 }),
        place({ planPlaceId: 1, orderIndex: 1 }),
        place({ planPlaceId: 2, orderIndex: 2 }),
        place({ planPlaceId: 2, orderIndex: 2 }),
      ],
    });
    expect(normalizePlanDetail(raw).planPlaceDetailDtos.map((p) => p.planPlaceId)).toEqual([1, 2]);
  });

  it('stayDescription 이 플랜 설명과 같으면 비운다 (C-02)', () => {
    const raw = plan({
      planDescription: 'QA 테스트 여행 기록',
      planPlaceDetailDtos: [place({ stayDescription: 'QA 테스트 여행 기록' })],
    });
    expect(normalizePlanDetail(raw).planPlaceDetailDtos[0].stayDescription).toBe('');
  });

  it('장소 고유 설명은 그대로 둔다', () => {
    const raw = plan({
      planDescription: 'QA 테스트 여행 기록',
      planPlaceDetailDtos: [place({ stayDescription: '조용한 북카페' })],
    });
    expect(normalizePlanDetail(raw).planPlaceDetailDtos[0].stayDescription).toBe('조용한 북카페');
  });

  it('planDescription 이 null 이어도 죽지 않는다', () => {
    const raw = plan({
      planDescription: null as unknown as string,
      planPlaceDetailDtos: [place({ stayDescription: null as unknown as string })],
    });
    expect(normalizePlanDetail(raw).planPlaceDetailDtos[0].stayDescription).toBe('');
  });
});
