import { buildNearbyQuery } from './nearbyQuery';
import { REGIONS } from '../constants/regions';

describe('buildNearbyQuery', () => {
  const gangwon = REGIONS.find((r) => r.id === 'gangwon')!;

  it('지역명 조회가 꺼져 있으면 대표 좌표를 보낸다', () => {
    expect(buildNearbyQuery(gangwon, false)).toEqual({ lat: gangwon.lat, lng: gangwon.lng });
  });

  it('지역명 조회가 켜져 있으면 지역명만 보낸다', () => {
    expect(buildNearbyQuery(gangwon, true)).toEqual({ region: '강원' });
  });
});
