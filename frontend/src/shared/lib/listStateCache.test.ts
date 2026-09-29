/** @jest-environment jsdom */
import { readListState, saveListState } from './listStateCache';

const state = (id: string) => ({ items: [{ id }], page: 1, hasNext: false, totalCount: 1 });

describe('listStateCache', () => {
  beforeEach(() => sessionStorage.clear());

  it('같은 조회 조건이면 저장한 목록을 복원한다', () => {
    saveListState('nearby', state('seoul-1'), 'seoul');
    expect(readListState('nearby', { paramsKey: 'seoul' })?.items).toEqual([{ id: 'seoul-1' }]);
  });

  it('조회 조건(지역)이 다르면 다른 지역의 목록을 복원하지 않는다', () => {
    saveListState('nearby', state('seoul-1'), 'seoul');
    expect(readListState('nearby', { paramsKey: 'busan' })).toBeNull();
  });

  it('조회 조건 없이 저장된 예전 캐시는 조건을 지정한 조회에서 복원하지 않는다', () => {
    saveListState('nearby', state('seoul-1'));
    expect(readListState('nearby', { paramsKey: 'busan' })).toBeNull();
  });
});
