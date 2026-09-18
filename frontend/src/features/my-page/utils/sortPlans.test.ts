import { sortMyPlansNewest, sortScrappedPlansNewest } from './sortPlans';

const plan = (planId: number, createAt: string | null) => ({ planId, createAt });

describe('sortMyPlansNewest', () => {
  it('생성일이 최신인 플랜이 위로 온다', () => {
    const out = sortMyPlansNewest([
      plan(1, '2026-08-01 10:00'),
      plan(2, '2026-09-03 09:00'),
      plan(3, '2026-08-20 18:30'),
    ]);
    expect(out.map((p) => p.planId)).toEqual([2, 3, 1]);
  });

  it("서버 형식 'yyyy-MM-dd HH:mm' 과 ISO 가 섞여도 시각으로 비교한다", () => {
    const out = sortMyPlansNewest([
      plan(1, '2026-09-03T08:00:00'),
      plan(2, '2026-09-03 09:00'),
    ]);
    expect(out.map((p) => p.planId)).toEqual([2, 1]);
  });

  it('같은 시각이면 id 가 큰(나중에 만든) 플랜이 위로 온다', () => {
    const out = sortMyPlansNewest([plan(5, '2026-09-03 09:00'), plan(9, '2026-09-03 09:00')]);
    expect(out.map((p) => p.planId)).toEqual([9, 5]);
  });

  it('생성일이 없거나 읽을 수 없으면 맨 아래로 보낸다', () => {
    const out = sortMyPlansNewest([plan(1, null), plan(2, '2026-09-01 10:00'), plan(3, 'img1')]);
    expect(out.map((p) => p.planId)).toEqual([2, 3, 1]);
  });

  it('원본 배열을 바꾸지 않는다', () => {
    const input = [plan(1, '2026-08-01 10:00'), plan(2, '2026-09-01 10:00')];
    sortMyPlansNewest(input);
    expect(input.map((p) => p.planId)).toEqual([1, 2]);
  });
});

describe('sortScrappedPlansNewest', () => {
  it('저장 시각(scrappedAt)이 있으면 최근에 저장한 플랜이 위로 온다', () => {
    const out = sortScrappedPlansNewest([
      { planId: 1, createAt: '2026-09-05 10:00', scrappedAt: '2026-09-06 10:00' },
      { planId: 2, createAt: '2026-07-01 10:00', scrappedAt: '2026-09-09 21:00' },
    ]);
    // 플랜 생성일은 1번이 더 최근이지만, 저장은 2번이 더 최근이다
    expect(out.map((p) => p.planId)).toEqual([2, 1]);
  });

  it('저장 시각이 없으면 서버가 준 순서를 그대로 둔다 (생성일로 대신 정렬하지 않는다)', () => {
    const out = sortScrappedPlansNewest([
      { planId: 1, createAt: '2026-07-01 10:00' },
      { planId: 2, createAt: '2026-09-05 10:00' },
      { planId: 3, createAt: '2026-08-01 10:00' },
    ]);
    expect(out.map((p) => p.planId)).toEqual([1, 2, 3]);
  });
});
