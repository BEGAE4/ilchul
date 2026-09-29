import { fitWithin } from './resizeImage';

describe('fitWithin', () => {
  it('긴 변을 한도에 맞추고 비율을 유지한다', () => {
    expect(fitWithin(4032, 3024, 1024)).toEqual({ width: 1024, height: 768 });
    expect(fitWithin(3024, 4032, 1024)).toEqual({ width: 768, height: 1024 });
  });

  it('이미 작으면 키우지 않는다', () => {
    expect(fitWithin(640, 480, 1024)).toEqual({ width: 640, height: 480 });
  });

  it('아주 길쭉해도 한 변이 0 이 되지 않는다', () => {
    expect(fitWithin(10000, 3, 1024)).toEqual({ width: 1024, height: 1 });
  });
});
