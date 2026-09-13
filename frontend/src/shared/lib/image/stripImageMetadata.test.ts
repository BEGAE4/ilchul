import {
  MAX_IMAGE_EDGE,
  fitWithinEdge,
  shouldReencodeImage,
  stripImageMetadata,
  toJpegFileName,
} from './stripImageMetadata';

describe('shouldReencodeImage', () => {
  it('촬영 메타데이터가 붙는 형식은 다시 인코딩한다', () => {
    ['image/jpeg', 'image/JPEG', 'image/heic', 'image/heif', 'image/webp'].forEach((type) => {
      expect(shouldReencodeImage(type)).toBe(true);
    });
  });

  it('PNG·GIF·알 수 없는 형식은 원본을 둔다', () => {
    ['image/png', 'image/gif', ''].forEach((type) => {
      expect(shouldReencodeImage(type)).toBe(false);
    });
  });
});

describe('fitWithinEdge', () => {
  it('긴 변이 제한 이하면 크기를 바꾸지 않는다', () => {
    expect(fitWithinEdge(4032, 3024)).toEqual({ width: 4032, height: 3024 });
  });

  it('48MP 원본은 비율을 유지한 채 긴 변을 제한에 맞춘다', () => {
    const { width, height } = fitWithinEdge(8064, 6048);
    expect(width).toBe(MAX_IMAGE_EDGE);
    expect(height).toBe(3072);
  });

  it('세로 사진도 긴 변 기준으로 줄인다', () => {
    expect(fitWithinEdge(3000, 9000, 3000)).toEqual({ width: 1000, height: 3000 });
  });
});

describe('toJpegFileName', () => {
  it('확장자를 .jpg 로 바꾼다', () => {
    expect(toJpegFileName('IMG_0001.HEIC')).toBe('IMG_0001.jpg');
    expect(toJpegFileName('photo.2026.jpeg')).toBe('photo.2026.jpg');
  });

  it('확장자나 이름이 없으면 기본 이름을 쓴다', () => {
    expect(toJpegFileName('camera')).toBe('camera.jpg');
    expect(toJpegFileName('.jpg')).toBe('photo.jpg');
  });
});

describe('stripImageMetadata', () => {
  it('브라우저 밖에서는 원본을 그대로 돌려준다', async () => {
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    await expect(stripImageMetadata(file)).resolves.toBe(file);
  });
});
