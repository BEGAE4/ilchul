import { uploadPlanImages, PlanImageUploadError } from './plan.api';
import apiClient from '@/shared/lib/api/apiClient';

jest.mock('@/shared/lib/api/apiClient', () => ({
  __esModule: true,
  default: { post: jest.fn(), get: jest.fn(), delete: jest.fn(), patch: jest.fn() },
}));
// 축소는 브라우저(canvas)가 필요하다 — 여기서는 묶어 보내는 규칙만 본다
jest.mock('@/shared/lib/image', () => ({
  __esModule: true,
  ...jest.requireActual('@/shared/lib/image/prepareImageForUpload'),
  prepareImageForUpload: jest.fn(async (file: unknown) => file),
}));
jest.mock('../utils/normalizePlanDetail', () => ({
  __esModule: true,
  normalizePlanDetail: (d: unknown) => d,
}));

const post = apiClient.post as jest.Mock;
const photo = (name: string) => ({ name }) as unknown as File;
const photos = (n: number) => Array.from({ length: n }, (_, i) => photo(`p${i + 1}.jpg`));
const sentNames = (call: unknown[]) =>
  ((call[1] as FormData).getAll('images') as unknown as { name: string }[]).map((f) => f.name);

// node 환경의 FormData 는 File 이 아닌 값을 문자열로 바꾼다 — 이름만 남기는 가짜로 대신한다
class FakeFormData {
  private items: [string, unknown][] = [];
  append(k: string, v: unknown) { this.items.push([k, v]); }
  getAll(k: string) { return this.items.filter(([key]) => key === k).map(([, v]) => v); }
}

describe('uploadPlanImages', () => {
  const RealFormData = global.FormData;
  beforeAll(() => { (global as unknown as { FormData: unknown }).FormData = FakeFormData; });
  afterAll(() => { global.FormData = RealFormData; });
  beforeEach(() => post.mockReset());

  it('5장 이하는 한 요청으로 보낸다', async () => {
    post.mockResolvedValue({ data: { planId: 7 } });
    await uploadPlanImages(7, photos(3));
    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][0]).toBe('/api/plan/7/images');
    expect(sentNames(post.mock.calls[0])).toEqual(['p1.jpg', 'p2.jpg', 'p3.jpg']);
  });

  it('5장을 넘으면 서버 한도(한 요청 5장)에 맞춰 나눠 보내고 마지막 응답을 돌려준다', async () => {
    post.mockResolvedValueOnce({ data: { planId: 7, step: 1 } }).mockResolvedValueOnce({ data: { planId: 7, step: 2 } });
    const result = await uploadPlanImages(7, photos(7));
    expect(post).toHaveBeenCalledTimes(2);
    expect(sentNames(post.mock.calls[0])).toHaveLength(5);
    expect(sentNames(post.mock.calls[1])).toEqual(['p6.jpg', 'p7.jpg']);
    expect(result).toEqual({ planId: 7, step: 2 });
  });

  it('두 번째 묶음이 실패하면 앞 묶음에서 올라간 장수를 실어 던진다', async () => {
    const cause = new Error('boom');
    post.mockResolvedValueOnce({ data: { planId: 7 } }).mockRejectedValueOnce(cause);
    await expect(uploadPlanImages(7, photos(7))).rejects.toMatchObject({
      name: 'PlanImageUploadError',
      uploaded: 5,
      total: 7,
      cause,
    });
  });

  it('첫 묶음부터 실패하면 올라간 장수는 0', async () => {
    post.mockRejectedValueOnce(new Error('boom'));
    const err = await uploadPlanImages(7, photos(2)).catch((e) => e);
    expect(err).toBeInstanceOf(PlanImageUploadError);
    expect(err.uploaded).toBe(0);
  });
});
