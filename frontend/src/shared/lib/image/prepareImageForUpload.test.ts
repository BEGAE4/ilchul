import {
  SAFE_REQUEST_BYTES,
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
  it('한 요청에 담는 장수만큼 용량을 나눈다 — 제한은 파일이 아니라 요청 전체에 걸린다', () => {
    expect(perImageBudget(1)).toBe(SAFE_REQUEST_BYTES);
    expect(perImageBudget(5)).toBe(Math.floor(SAFE_REQUEST_BYTES / 5));
  });

  it('0 장 이하는 한 장으로 본다', () => {
    expect(perImageBudget(0)).toBe(SAFE_REQUEST_BYTES);
  });
});

describe('needsShrink', () => {
  const MB = 1024 * 1024;
  it('JPEG·HEIC·WEBP 는 크기와 상관없이 다시 그린다 (촬영 위치 등 EXIF 제거)', () => {
    expect(needsShrink('image/jpeg', 10_000, MB)).toBe(true);
    expect(needsShrink('image/heic', 10_000, MB)).toBe(true);
  });

  it('PNG·GIF 는 한도를 넘을 때만 줄인다 (투명도·애니메이션 보존)', () => {
    expect(needsShrink('image/png', 10_000, MB)).toBe(false);
    expect(needsShrink('image/png', 2 * MB, MB)).toBe(true);
    expect(needsShrink('image/gif', 2 * MB, MB)).toBe(true);
  });
});

describe('photoUploadErrorMessage', () => {
  const axiosError = (status?: number) => ({ isAxiosError: true, response: status ? { status } : undefined });

  it('413 과 줄일 수 없는 큰 사진은 용량 문제로 안내한다 — 413 은 nginx 가 HTML 로 답해 상태코드로만 알 수 있다', () => {
    expect(photoUploadErrorMessage(axiosError(413), '기본')).toBe('사진 용량이 너무 커요. 다른 사진으로 시도해주세요.');
    expect(photoUploadErrorMessage(new Error('image_too_large'), '기본')).toBe('사진 용량이 너무 커요. 다른 사진으로 시도해주세요.');
  });

  it('응답이 없으면 네트워크 안내, 그 외는 화면이 준 기본 문구', () => {
    expect(photoUploadErrorMessage(axiosError(), '기본')).toBe('네트워크 연결을 확인한 뒤 다시 시도해주세요.');
    expect(photoUploadErrorMessage(axiosError(500), '기본 문구')).toBe('기본 문구');
    expect(photoUploadErrorMessage(null, '기본 문구')).toBe('기본 문구');
  });
});
