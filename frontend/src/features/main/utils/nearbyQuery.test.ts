import { buildNearbyQuery } from './nearbyQuery';
import { REGIONS } from '../constants/regions';

describe('buildNearbyQuery', () => {
  it('지역명으로 조회한다 — 좌표는 보내지 않는다', () => {
    const chungnam = REGIONS.find((r) => r.id === 'chungnam')!;
    expect(buildNearbyQuery(chungnam)).toEqual({ region: '충남' });
  });

  it('모든 지역이 화면에 보이는 짧은 이름 그대로 나간다', () => {
    REGIONS.forEach((r) => expect(buildNearbyQuery(r)).toEqual({ region: r.name }));
  });
});
