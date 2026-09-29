import { fixRoParticle, withRo } from './josa';

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

describe('fixRoParticle', () => {
  it('받침 없는 글자 뒤의 "으로"를 "로"로 고친다 (B-23 잔존 데이터)', () => {
    expect(fixRoParticle('도보으로 떠나는 나만의 힐링 여행')).toBe('도보로 떠나는 나만의 힐링 여행');
    expect(fixRoParticle('버스으로 가요')).toBe('버스로 가요');
  });

  it('ㄹ 받침 뒤의 "으로"도 "로"로 고친다', () => {
    expect(fixRoParticle('지하철으로 이동')).toBe('지하철로 이동');
  });

  it('맞게 쓰인 "으로"는 건드리지 않는다', () => {
    expect(fixRoParticle('대중교통으로 떠나는 나만의 힐링 여행')).toBe('대중교통으로 떠나는 나만의 힐링 여행');
    expect(fixRoParticle('자가용으로 떠나는')).toBe('자가용으로 떠나는');
    expect(fixRoParticle('도보로 떠나는')).toBe('도보로 떠나는');
  });

  it('여러 번 나와도 전부 고치고, 비어 있으면 빈 문자열', () => {
    expect(fixRoParticle('도보으로 가고 버스으로 온다')).toBe('도보로 가고 버스로 온다');
    expect(fixRoParticle('')).toBe('');
    expect(fixRoParticle(null)).toBe('');
    expect(fixRoParticle(undefined)).toBe('');
  });
});
