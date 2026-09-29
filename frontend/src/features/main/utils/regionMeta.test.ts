import { indexRegionMeta, pickSigunguChips, pruneSigungu } from './regionMeta';
import type { RegionMeta } from '../types';

const jeonnam: RegionMeta = {
  region: '광주·전남', name: '광주·전남', aliases: ['전남', '광주', '전라남도'], placeCount: 34,
  sigungu: [
    { sigungu: '동구', placeCount: 2 }, { sigungu: '서구', placeCount: 0 }, { sigungu: '순천시', placeCount: 9 },
    { sigungu: '여수시', placeCount: 9 }, { sigungu: '남구', placeCount: 1 },
  ],
};
const seoul: RegionMeta = { region: '서울', name: '서울', aliases: ['서울특별시'], placeCount: 27, sigungu: [] };

describe('indexRegionMeta', () => {
  it('화면 이름과 별칭으로 모두 찾을 수 있다', () => {
    const idx = indexRegionMeta([jeonnam, seoul]);
    expect(idx['광주·전남']).toBe(jeonnam);
    expect(idx['전남']).toBe(jeonnam);
    expect(idx['광주']).toBe(jeonnam);
    expect(idx['서울특별시']).toBe(seoul);
  });
});

describe('pickSigunguChips', () => {
  it('장소가 있는 시군구만 많은 순으로, 같으면 이름 순', () => {
    expect(pickSigunguChips(jeonnam).map((s) => s.sigungu)).toEqual(['순천시', '여수시', '동구', '남구']);
  });
  it('메타가 없으면 빈 배열', () => {
    expect(pickSigunguChips(undefined)).toEqual([]);
  });
});

describe('pruneSigungu', () => {
  it('장소가 0이 된 시군구는 선택에서 뺀다', () => {
    expect(pruneSigungu(['동구', '서구', '순천시'], jeonnam)).toEqual(['동구', '순천시']);
  });
  it('메타가 아직 없으면 그대로 둔다', () => {
    expect(pruneSigungu(['동구'], undefined)).toEqual(['동구']);
  });
});
