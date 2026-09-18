import { computeKeyboardInset } from './keyboardInset';

describe('computeKeyboardInset', () => {
  it('키보드가 없으면 0', () => {
    expect(computeKeyboardInset(664, 664, 0)).toBe(0);
  });

  it('키보드가 보이는 영역을 줄인 만큼이 가려진 높이다', () => {
    expect(computeKeyboardInset(664, 328, 0)).toBe(336);
  });

  it('Safari 가 화면을 위로 밀어 올린 만큼(offsetTop)은 뺀다', () => {
    expect(computeKeyboardInset(664, 328, 120)).toBe(216);
  });

  it('주소창이 접히고 펴지는 정도의 작은 차이는 키보드로 보지 않는다', () => {
    expect(computeKeyboardInset(664, 630, 0)).toBe(0);
  });

  it('음수가 되지 않는다', () => {
    expect(computeKeyboardInset(600, 664, 0)).toBe(0);
  });
});
