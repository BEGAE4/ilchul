import { profileImageErrorMessage } from './profileImageError';

const axiosError = (status?: number) => ({ isAxiosError: true, response: status ? { status } : undefined });

describe('profileImageErrorMessage', () => {
  it('400 은 형식 문제로 안내한다', () => {
    expect(profileImageErrorMessage(axiosError(400))).toBe('JPG, PNG, WEBP 사진만 올릴 수 있어요.');
  });

  it('413 은 용량 문제 — nginx 가 HTML 로 답하므로 상태코드로만 판별한다', () => {
    expect(profileImageErrorMessage(axiosError(413))).toBe('사진 용량이 너무 커요. 다른 사진으로 시도해주세요.');
  });

  it('401 은 로그인 안내', () => {
    expect(profileImageErrorMessage(axiosError(401))).toBe('로그인이 필요해요. 다시 로그인해주세요.');
  });

  it('응답이 없으면(네트워크) 연결 안내, 그 외는 공통 문구', () => {
    expect(profileImageErrorMessage(axiosError())).toBe('네트워크 연결을 확인한 뒤 다시 시도해주세요.');
    expect(profileImageErrorMessage(axiosError(500))).toBe('사진을 올리지 못했어요. 잠시 후 다시 시도해주세요.');
    expect(profileImageErrorMessage(new Error('decode'))).toBe('사진을 올리지 못했어요. 잠시 후 다시 시도해주세요.');
  });
});
