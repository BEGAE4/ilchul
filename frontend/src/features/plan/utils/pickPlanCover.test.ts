import { pickPlanCover } from './pickPlanCover';
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
    planTitle: '플랜',
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
    planImages: [],
    tags: [],
    thumbnailUrl: '',
    planPlaceDetailDtos: [],
    ...overrides,
  };
}

describe('pickPlanCover', () => {
  it('업로드 썸네일이 있으면 그것을 고른다', () => {
    const p = plan({
      thumbnailUrl: 'https://cdn/thumb.jpg',
      planImageUrls: ['https://cdn/plan1.jpg'],
      planPlaceDetailDtos: [place({ placeImage: 'https://cdn/place.jpg' })],
    });
    expect(pickPlanCover(p)).toBe('https://cdn/thumb.jpg');
  });

  it('썸네일이 없으면 기록 사진 첫 장을 고른다', () => {
    const p = plan({
      planImageUrls: ['https://cdn/plan1.jpg', 'https://cdn/plan2.jpg'],
      planPlaceDetailDtos: [place({ placeImage: 'https://cdn/place.jpg' })],
    });
    expect(pickPlanCover(p)).toBe('https://cdn/plan1.jpg');
  });

  it('기록 사진도 없으면 방문 순서상 첫 번째로 이미지가 있는 장소 사진을 고른다', () => {
    const p = plan({
      planPlaceDetailDtos: [
        place({ planPlaceId: 3, orderIndex: 3, placeImage: 'https://cdn/third.jpg' }),
        place({ planPlaceId: 1, orderIndex: 1, placeImage: '' }),
        place({ planPlaceId: 2, orderIndex: 2, placeImage: 'https://cdn/second.jpg' }),
      ],
    });
    expect(pickPlanCover(p)).toBe('https://cdn/second.jpg');
  });

  it('아무 이미지도 없으면 null 을 돌려준다', () => {
    const p = plan({ planPlaceDetailDtos: [place({ placeImage: '' })] });
    expect(pickPlanCover(p)).toBeNull();
  });

  it('배열 필드가 null 로 와도 죽지 않는다', () => {
    const p = plan({
      planImageUrls: null as unknown as string[],
      planPlaceDetailDtos: null as unknown as PlanPlaceDetail[],
    });
    expect(pickPlanCover(p)).toBeNull();
  });
});
