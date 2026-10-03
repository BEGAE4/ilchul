import { buildCreatePlanPlaces, parseStayMinutes } from './planPlaces';
import type { Place } from '@/shared/types';
import type { PlanPreviewPlace } from '@/features/plan/types/plan.types';

const stop = (id: string, time: string): Place => ({
  id,
  name: `장소${id}`,
  category: '카페',
  time,
  description: '',
  image: '',
  address: '서울',
  phone: '',
  tags: [],
});

const preview = (order: number, duration: number, stayTime?: number, placeId = order === 1 ? 13 : 94): PlanPreviewPlace =>
  ({
    placeId,
    placeName: '',
    addressName: '',
    roadAddressName: '',
    categoryName: '',
    duration,
    order,
    x: 0,
    y: 0,
    ...(stayTime === undefined ? {} : { stayTime }),
  }) as PlanPreviewPlace;

describe('parseStayMinutes', () => {
  it("'90분' 에서 숫자를 뽑는다", () => {
    expect(parseStayMinutes('90분')).toBe(90);
  });

  it('숫자가 없으면 기본 60분', () => {
    expect(parseStayMinutes('')).toBe(60);
  });
});

describe('buildCreatePlanPlaces', () => {
  it('프리뷰의 구간 이동시간을 order 기준으로 붙인다', () => {
    const result = buildCreatePlanPlaces(
      [stop('13', '60분'), stop('94', '90분')],
      [preview(2, 17, 30), preview(1, 13, 40)]
    );
    expect(result).toEqual([
      { placeId: 13, order: 1, travelTime: 13, stayTime: 40 },
      { placeId: 94, order: 2, travelTime: 17, stayTime: 30 },
    ]);
  });

  it('프리뷰에 stayTime 이 없으면 추천 결과의 체류시간으로 채운다 (운영 응답에 stayTime 필드 없음)', () => {
    const result = buildCreatePlanPlaces(
      [stop('13', '90분'), stop('94', '45분')],
      [preview(1, 13), preview(2, 17)]
    );
    expect(result.map((p) => p.stayTime)).toEqual([90, 45]);
  });

  it('프리뷰 stayTime 이 0 이면 비어 있는 값으로 보고 추천 체류시간을 쓴다', () => {
    const result = buildCreatePlanPlaces([stop('13', '90분')], [preview(1, 13, 0)]);
    expect(result[0].stayTime).toBe(90);
  });

  it('프리뷰가 없으면 저장 요청을 만들지 않는다', () => {
    expect(() => buildCreatePlanPlaces([stop('13', '75분')], [])).toThrow('preview_mismatch');
  });

  it('placeId가 다르면 같은 order라도 저장을 막는다', () => {
    expect(() => buildCreatePlanPlaces([stop('13', '60분')], [preview(1, 10, 60, 94)])).toThrow('preview_mismatch');
  });

  it('숫자가 아닌 id는 저장을 막는다', () => {
    expect(() => buildCreatePlanPlaces([stop('abc', '60분')], [preview(1, 0)])).toThrow('preview_mismatch');
  });

  it('출발지와 같은 장소의 실제 0분은 허용한다', () => {
    expect(buildCreatePlanPlaces([stop('13', '60분')], [preview(1, 0)])[0].travelTime).toBe(0);
  });
});
