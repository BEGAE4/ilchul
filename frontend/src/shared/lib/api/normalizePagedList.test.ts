import { normalizePagedList } from './normalizePagedList';

describe('normalizePagedList', () => {
  const items = [{ id: 1 }, { id: 2 }];

  it('페이징 필드가 없으면 전체 목록을 한 페이지로 취급한다 (hasNext=false, totalCount=길이)', () => {
    const res = normalizePagedList(items, { plans: items } as never, { page: 1, limit: 20 });
    expect(res.data).toBe(items);
    expect(res.page).toBe(1);
    expect(res.hasNext).toBe(false);
    expect(res.totalCount).toBe(2);
  });

  it('서버가 페이징 필드를 주면 그대로 쓴다', () => {
    const res = normalizePagedList(items, { page: 3, limit: 2, hasNext: true, totalCount: 42 }, { page: 3, limit: 2 });
    expect(res.page).toBe(3);
    expect(res.limit).toBe(2);
    expect(res.hasNext).toBe(true);
    expect(res.totalCount).toBe(42);
  });

  it('204 처럼 본문이 없어도 빈 목록으로 정규화한다', () => {
    const res = normalizePagedList([], null, { page: 1, limit: 20 });
    expect(res.data).toEqual([]);
    expect(res.hasNext).toBe(false);
    expect(res.totalCount).toBe(0);
  });
});
