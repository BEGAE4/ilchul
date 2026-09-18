import apiClient from '@/shared/lib/api/apiClient';
import { clonePlanWithSchedule } from './plan.api';

jest.mock('@/shared/lib/api/apiClient', () => ({
  __esModule: true,
  default: { post: jest.fn(), patch: jest.fn() },
}));

const post = apiClient.post as jest.Mock;
const patch = apiClient.patch as jest.Mock;

const schedule = { date: '2026-09-13', startTime: '10:00', endTime: '12:30' };

describe('clonePlanWithSchedule', () => {
  beforeEach(() => {
    post.mockReset();
    patch.mockReset();
  });

  it('복제 후 수정 API 로 여행 일시를 채운다 (서버 복제 API 는 scheduledDate 를 반영하지 않음)', async () => {
    post.mockResolvedValue({ data: { planId: 56, originalPlanId: 11, createAt: '' } });
    patch.mockResolvedValue({ data: { planId: 56 } });

    const res = await clonePlanWithSchedule(11, schedule);

    expect(post).toHaveBeenCalledWith('/api/plan/11/clone', { scheduledDate: '2026-09-13' });
    expect(patch).toHaveBeenCalledWith('/api/plan/56', {
      tripStartDate: '2026-09-13 10:00',
      tripEndDate: '2026-09-13 12:30',
    });
    expect(res).toEqual({ planId: 56, scheduleSaved: true });
  });

  it('일시 저장만 실패하면 복제는 유지하고 scheduleSaved=false 로 알린다', async () => {
    post.mockResolvedValue({ data: { planId: 57, originalPlanId: 11, createAt: '' } });
    patch.mockRejectedValue(new Error('500'));

    await expect(clonePlanWithSchedule(11, schedule)).resolves.toEqual({
      planId: 57,
      scheduleSaved: false,
    });
  });

  it('복제 자체가 실패하면 예외를 그대로 던지고 수정 API 는 부르지 않는다', async () => {
    post.mockRejectedValue(new Error('409'));

    await expect(clonePlanWithSchedule(11, schedule)).rejects.toThrow('409');
    expect(patch).not.toHaveBeenCalled();
  });
});
