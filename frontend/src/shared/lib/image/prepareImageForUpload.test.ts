import {
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_REQUEST,
  SAFE_REQUEST_BYTES,
  chunkForUpload,
  isUploadableType,
  edgeSteps,
  fitWithin,
  needsShrink,
  perImageBudget,
  photoUploadErrorMessage,
} from './prepareImageForUpload';

describe('fitWithin', () => {
  it('긴 변을 한도에 맞추고 비율을 유지한다', () => {
    expect(fitWithin(4032, 3024, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3024, 4032, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it('이미 작으면 키우지 않고, 아주 길쭉해도 한 변이 0 이 되지 않는다', () => {
    expect(fitWithin(640, 480, 1600)).toEqual({ width: 640, height: 480 });
    expect(fitWithin(10000, 3, 1024)).toEqual({ width: 1024, height: 1 });
  });
});

describe('edgeSteps', () => {
  it('처음 크기에서 시작해 점점 작은 크기로 내려간다', () => {
    expect(edgeSteps(1600)).toEqual([1600, 1280, 1024, 800, 640]);
    expect(edgeSteps(1024)).toEqual([1024, 800, 640]);
    expect(edgeSteps(500)).toEqual([500]);
  });
});

describe('perImageBudget', () => {
  it('한 장의 한도는 서버의 파일 한도(15MB)보다 충분히 작다', () => {
    expect(MAX_IMAGE_BYTES).toBeLessThan(15 * 1024 * 1024);
    expect(perImageBudget(1)).toBe(MAX_IMAGE_BYTES);
  });

  it('한 요청에 담는 최대 장수까지는 장당 한도를 그대로 쓴다 — 요청 한도(80MB)에 여유가 있다', () => {
    expect(perImageBudget(MAX_IMAGES_PER_REQUEST)).toBe(MAX_IMAGE_BYTES);
    expect(MAX_IMAGES_PER_REQUEST * MAX_IMAGE_BYTES).toBeLessThanOrEqual(SAFE_REQUEST_BYTES);
  });

  it('장수가 아주 많으면 요청 한도를 나눠 쓴다. 0 장 이하는 한 장으로 본다', () => {
    expect(perImageBudget(100)).toBe(Math.floor(SAFE_REQUEST_BYTES / 100));
    expect(perImageBudget(0)).toBe(MAX_IMAGE_BYTES);
  });
});

describe('chunkForUpload', () => {
  it('서버가 한 요청에 받는 5장씩 끊는다', () => {
    expect(MAX_IMAGES_PER_REQUEST).toBe(5);
    expect(chunkForUpload([1, 2, 3, 4, 5, 6, 7])).toEqual([[1, 2, 3, 4, 5], [6, 7]]);
    expect(chunkForUpload([1, 2])).toEqual([[1, 2]]);
    expect(chunkForUpload([])).toEqual([]);
  });
});

describe('needsShrink', () => {
  const MB = 1024 * 1024;
  it('JPEG·HEIC·WEBP 는 크기와 상관없이 다시 그린다 (촬영 위치 등 EXIF 제거)', () => {
    expect(needsShrink('image/jpeg', 10_000, MB)).toBe(true);
    expect(needsShrink('image/heic', 10_000, MB)).toBe(true);
  });

  it('PNG 는 한도를 넘을 때만 줄인다 (투명도 보존)', () => {
    expect(needsShrink('image/png', 10_000, MB)).toBe(false);
    expect(needsShrink('image/png', 2 * MB, MB)).toBe(true);
  });

  it('서버가 받지 않는 형식(GIF·BMP·AVIF·형식 없음)은 작아도 JPEG 로 바꾼다 — 서버는 JPEG·PNG·WEBP 만 받는다', () => {
    expect(needsShrink('image/gif', 10_000, MB)).toBe(true);
    expect(needsShrink('image/bmp', 10_000, MB)).toBe(true);
    expect(needsShrink('image/avif', 10_000, MB)).toBe(true);
    expect(needsShrink('', 10_000, MB)).toBe(true);
  });
});

describe('isUploadableType', () => {
  it('서버 ImageFileValidator 가 받는 형식만 참', () => {
    expect(isUploadableType('image/jpeg')).toBe(true);
    expect(isUploadableType('IMAGE/PNG')).toBe(true);
    expect(isUploadableType('image/webp')).toBe(true);
    expect(isUploadableType('image/gif')).toBe(false);
    expect(isUploadableType('image/heic')).toBe(false);
  });
});

describe('photoUploadErrorMessage', () => {
  const axiosError = (status?: number) => ({ isAxiosError: true, response: status ? { status } : undefined });

  it('열 수 없고 서버도 받지 않는 형식은 형식 문제로 안내한다', () => {
    expect(photoUploadErrorMessage(new Error('image_unsupported'), '기본')).toBe(
      '지원하지 않는 사진 형식이에요. JPG·PNG 사진으로 올려주세요.'
    );
  });

  it('413 과 줄일 수 없는 큰 사진은 용량 문제로 안내한다', () => {
    expect(photoUploadErrorMessage(axiosError(413), '기본')).toBe('사진 용량이 너무 커요. 다른 사진으로 시도해주세요.');
    expect(photoUploadErrorMessage(new Error('image_too_large'), '기본')).toBe('사진 용량이 너무 커요. 다른 사진으로 시도해주세요.');
  });

  it('응답이 없으면 네트워크 안내, 그 외는 화면이 준 기본 문구', () => {
    expect(photoUploadErrorMessage(axiosError(), '기본')).toBe('네트워크 연결을 확인한 뒤 다시 시도해주세요.');
    expect(photoUploadErrorMessage(axiosError(500), '기본 문구')).toBe('기본 문구');
    expect(photoUploadErrorMessage(null, '기본 문구')).toBe('기본 문구');
  });
});
