/** @jest-environment jsdom */
import {
  markPlanJustCreated,
  readCreatedPlanBack,
  markBackGuardPushed,
  clearCreatedPlanBack,
} from './createdPlanBack';

describe('createdPlanBack', () => {
  beforeEach(() => sessionStorage.clear());

  it('방금 만든 플랜의 상세에서만 값을 돌려준다', () => {
    markPlanJustCreated(12);
    expect(readCreatedPlanBack('12')).toEqual({ planId: '12', guardPushed: false });
    expect(readCreatedPlanBack('99')).toBeNull();
  });

  it('표시가 없으면 null — 다른 경로로 들어온 상세는 평소처럼 뒤로 간다', () => {
    expect(readCreatedPlanBack('12')).toBeNull();
  });

  it('기록을 한 번 쌓았다는 표시를 남겨 다시 들어와도 중복으로 쌓지 않는다', () => {
    markPlanJustCreated('12');
    markBackGuardPushed('12');
    expect(readCreatedPlanBack('12')).toEqual({ planId: '12', guardPushed: true });
  });

  it('지우면 더 이상 적용되지 않는다', () => {
    markPlanJustCreated('12');
    clearCreatedPlanBack();
    expect(readCreatedPlanBack('12')).toBeNull();
  });

  it('깨진 값은 무시한다', () => {
    sessionStorage.setItem('ilchul:created-plan-back', '{oops');
    expect(readCreatedPlanBack('12')).toBeNull();
  });
});
