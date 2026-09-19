import { reviewErrorMessage } from './reviewErrorMessage';

const axiosError = (status?: number) => ({ isAxiosError: true, response: status ? { status } : undefined });

describe('reviewErrorMessage', () => {
  it('403 은 남의 후기', () => {
    expect(reviewErrorMessage(axiosError(403), '삭제')).toBe('내가 쓴 후기만 삭제할 수 있어요.');
    expect(reviewErrorMessage(axiosError(403), '수정')).toBe('내가 쓴 후기만 수정할 수 있어요.');
  });

  it('404 는 이미 지워진 후기', () => {
    expect(reviewErrorMessage(axiosError(404), '삭제')).toBe('이미 삭제된 후기예요.');
  });

  it('401 은 로그인 안내, 그 외는 동작을 넣은 공통 문구', () => {
    expect(reviewErrorMessage(axiosError(401), '수정')).toBe('로그인이 필요해요. 다시 로그인해주세요.');
    expect(reviewErrorMessage(axiosError(500), '수정')).toBe('후기를 수정하지 못했어요. 잠시 후 다시 시도해주세요.');
    expect(reviewErrorMessage(new Error('x'), '삭제')).toBe('후기를 삭제하지 못했어요. 잠시 후 다시 시도해주세요.');
  });
});
