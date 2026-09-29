import { mergeFreshItems } from './mergeFreshItems';

type Item = { id: number; likes: number; title: string };

describe('mergeFreshItems', () => {
  it('복원한 목록의 순서는 그대로 두고, 새로 받은 값(좋아요 수 등)으로 갱신한다', () => {
    const cached: Item[] = [
      { id: 1, likes: 3, title: 'a' },
      { id: 2, likes: 1, title: 'b' },
    ];
    const fresh: Item[] = [
      { id: 2, likes: 5, title: 'b' },
      { id: 1, likes: 4, title: 'a' },
    ];
    expect(mergeFreshItems(cached, fresh)).toEqual([
      { id: 1, likes: 4, title: 'a' },
      { id: 2, likes: 5, title: 'b' },
    ]);
  });

  it('새 응답에 없는 항목은 지우지 않고 그대로 둔다(스크롤 위치 유지)', () => {
    const cached: Item[] = [
      { id: 1, likes: 3, title: 'a' },
      { id: 2, likes: 1, title: 'b' },
    ];
    expect(mergeFreshItems(cached, [{ id: 1, likes: 0, title: 'a' }])).toEqual([
      { id: 1, likes: 0, title: 'a' },
      { id: 2, likes: 1, title: 'b' },
    ]);
  });

  it('바뀐 게 없으면 같은 배열을 돌려준다(불필요한 리렌더 방지)', () => {
    const cached: Item[] = [{ id: 1, likes: 3, title: 'a' }];
    expect(mergeFreshItems(cached, [{ id: 1, likes: 3, title: 'a' }])).toBe(cached);
  });
});
