import { resolveRegionByCoord } from './resolveRegion';
import { REGIONS } from '../constants/regions';

describe('resolveRegionByCoord', () => {
  it('좌표가 없으면 null', () => {
    expect(resolveRegionByCoord(null)).toBeNull();
  });

  it('각 지역 대표 좌표는 자기 자신으로 판정된다', () => {
    for (const r of REGIONS) {
      expect(resolveRegionByCoord({ lat: r.lat, lng: r.lng })?.id).toBe(r.id);
    }
  });

  it('서울 시내 임의 지점 → 서울', () => {
    // 강남역
    expect(resolveRegionByCoord({ lat: 37.4979, lng: 127.0276 })?.id).toBe('seoul');
    // 홍대입구역
    expect(resolveRegionByCoord({ lat: 37.5572, lng: 126.9245 })?.id).toBe('seoul');
  });

  it('광역시는 인접 도가 아니라 자기 지역으로 판정된다', () => {
    // 해운대 → 부산
    expect(resolveRegionByCoord({ lat: 35.1587, lng: 129.1604 })?.id).toBe('busan');
    // 제주 서귀포 → 제주
    expect(resolveRegionByCoord({ lat: 33.2541, lng: 126.56 })?.id).toBe('jeju');
  });

  it('대표 좌표에서 먼 같은 도 안의 지점도 가장 가까운 지역으로 떨어진다', () => {
    // 속초 → 강원(강릉)
    expect(resolveRegionByCoord({ lat: 38.207, lng: 128.5918 })?.id).toBe('gangwon');
    // 안동 → 경북(경주)
    expect(resolveRegionByCoord({ lat: 36.5684, lng: 128.7294 })?.id).toBe('gyeongbuk');
  });

  it('국내에서 지나치게 먼 좌표는 null (도쿄·적도 부근)', () => {
    expect(resolveRegionByCoord({ lat: 35.6762, lng: 139.6503 })).toBeNull();
    expect(resolveRegionByCoord({ lat: 0, lng: 0 })).toBeNull();
  });

  it('유효하지 않은 좌표는 null', () => {
    expect(resolveRegionByCoord({ lat: Number.NaN, lng: 127 })).toBeNull();
    expect(resolveRegionByCoord({ lat: 999, lng: 127 })).toBeNull();
  });
});
