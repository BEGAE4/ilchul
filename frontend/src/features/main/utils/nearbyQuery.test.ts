import { buildNearbyQuery } from './nearbyQuery';
import { REGIONS } from '../constants/regions';

describe('buildNearbyQuery', () => {
  it('지역명으로 조회한다 — 좌표는 보내지 않는다', () => {
    const chungnam = REGIONS.find((r) => r.id === 'chungnam')!;
    expect(buildNearbyQuery(chungnam)).toEqual({ region: '충남' });
  });

  it('queryName 이 없는 지역은 화면에 보이는 짧은 이름 그대로 나간다', () => {
    REGIONS.filter((r) => !r.queryName).forEach((r) =>
      expect(buildNearbyQuery(r)).toEqual({ region: r.name })
    );
  });

  it('광주·전남은 서버가 받는 "전남" 으로 조회한다 — "광주" 는 0건이다', () => {
    const jeonnam = REGIONS.find((r) => r.id === 'jeonnam')!;
    expect(jeonnam.name).toBe('광주·전남');
    expect(buildNearbyQuery(jeonnam)).toEqual({ region: '전남' });
  });

  it('서버에 나가는 지역명에 "광주" 단독은 없다', () => {
    expect(REGIONS.map((r) => buildNearbyQuery(r).region)).not.toContain('광주');
  });
});
