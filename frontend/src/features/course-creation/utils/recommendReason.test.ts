/**
 * @jest-environment jsdom
 */
import { extractRecommendReasoning, readReasonCollapsed, writeReasonCollapsed } from './recommendReason';

describe('extractRecommendReasoning', () => {
  it('plan.reasoning 을 앞뒤 공백을 지워 돌려준다', () => {
    expect(extractRecommendReasoning({ plan: { reasoning: '  숲길과 조용한 카페로 골랐어요. ' } })).toBe(
      '숲길과 조용한 카페로 골랐어요.'
    );
  });

  it('plan 이나 reasoning 이 없으면 빈 문자열', () => {
    expect(extractRecommendReasoning({ items: [] })).toBe('');
    expect(extractRecommendReasoning({ plan: { reasoning: null } })).toBe('');
    expect(extractRecommendReasoning({ plan: { reasoning: '   ' } })).toBe('');
    expect(extractRecommendReasoning(null)).toBe('');
    expect(extractRecommendReasoning([])).toBe('');
  });
});

describe('접힘 기억', () => {
  beforeEach(() => localStorage.clear());

  it('기본은 펼침(false)', () => {
    expect(readReasonCollapsed()).toBe(false);
  });

  it('접으면 기억하고, 다시 펼치면 지운다', () => {
    writeReasonCollapsed(true);
    expect(readReasonCollapsed()).toBe(true);
    writeReasonCollapsed(false);
    expect(readReasonCollapsed()).toBe(false);
  });
});
