import { withRo } from './josa';

describe('withRo', () => {
  it('받침 없는 단어에는 "로"를 붙인다 (B-23: 도보으로 → 도보로)', () => {
    expect(withRo('도보')).toBe('도보로');
    expect(withRo('버스')).toBe('버스로');
  });

  it('받침 있는 단어에는 "으로"를 붙인다', () => {
    expect(withRo('대중교통')).toBe('대중교통으로');
    expect(withRo('자가용')).toBe('자가용으로');
  });

  it('ㄹ 받침은 "로"를 붙인다', () => {
    expect(withRo('지하철')).toBe('지하철로');
  });

  it('한글이 아니거나 비어 있으면 그대로 "로" / 빈 문자열', () => {
    expect(withRo('KTX')).toBe('KTX로');
    expect(withRo('')).toBe('');
    expect(withRo('  ')).toBe('');
  });
});
