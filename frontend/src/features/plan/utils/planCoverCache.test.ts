import { loadPlanCover, resetPlanCoverCache } from './planCoverCache';
import * as planApi from '../api/plan.api';
import type { PlanDetail } from '../types/plan.types';

jest.mock('../api/plan.api', () => ({ fetchPlanDetail: jest.fn() }));
const fetchPlanDetail = planApi.fetchPlanDetail as jest.MockedFunction<typeof planApi.fetchPlanDetail>;

function detail(overrides: Partial<PlanDetail> = {}): PlanDetail {
  return {
    planId: 33,
    planTitle: '플랜',
    tripStartDate: '',
    tripEndDate: '',
    createAt: '',
    planVerified: false,
    isPlanVisible: true,
    isBookmarked: false,
    isLiked: false,
    requiredTime: 0,
    totalDistance: 0,
    planDescription: '',
    likeCount: 0,
    bookmarkCount: 0,
    userId: 1,
    userNickname: '',
    userAvatar: '',
    planImageUrls: [],
    planImages: [],
    tags: [],
    thumbnailUrl: '',
    planPlaceDetailDtos: [],
    ...overrides,
  };
}

beforeEach(() => {
  resetPlanCoverCache();
  fetchPlanDetail.mockReset();
});

describe('loadPlanCover', () => {
  it('상세를 조회해 대표 이미지를 돌려준다', async () => {
    fetchPlanDetail.mockResolvedValue(detail({ thumbnailUrl: 'https://cdn/thumb.jpg' }));
    await expect(loadPlanCover(33)).resolves.toBe('https://cdn/thumb.jpg');
    expect(fetchPlanDetail).toHaveBeenCalledWith(33);
  });

  it('같은 플랜은 동시에 여러 번 요청해도 상세 조회는 한 번만 한다', async () => {
    fetchPlanDetail.mockResolvedValue(detail({ thumbnailUrl: 'https://cdn/thumb.jpg' }));
    const [a, b] = await Promise.all([loadPlanCover(33), loadPlanCover(33)]);
    expect(a).toBe('https://cdn/thumb.jpg');
    expect(b).toBe('https://cdn/thumb.jpg');
    expect(fetchPlanDetail).toHaveBeenCalledTimes(1);
  });

  it('한 번 받은 결과는 다시 요청하지 않는다', async () => {
    fetchPlanDetail.mockResolvedValue(detail());
    await loadPlanCover(33);
    await loadPlanCover(33);
    expect(fetchPlanDetail).toHaveBeenCalledTimes(1);
  });

  it('상세 조회가 실패하면 null 을 돌려주고 throw 하지 않는다', async () => {
    fetchPlanDetail.mockRejectedValue(new Error('403'));
    await expect(loadPlanCover(33)).resolves.toBeNull();
  });

  it('실패한 플랜은 다음 요청에서 다시 시도한다', async () => {
    fetchPlanDetail.mockRejectedValueOnce(new Error('네트워크'));
    fetchPlanDetail.mockResolvedValueOnce(detail({ thumbnailUrl: 'https://cdn/thumb.jpg' }));
    await expect(loadPlanCover(33)).resolves.toBeNull();
    await expect(loadPlanCover(33)).resolves.toBe('https://cdn/thumb.jpg');
    expect(fetchPlanDetail).toHaveBeenCalledTimes(2);
  });
});
