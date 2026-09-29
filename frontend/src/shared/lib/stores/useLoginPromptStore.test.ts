import { useLoginPromptStore } from './useLoginPromptStore';

describe('useLoginPromptStore', () => {
  beforeEach(() => {
    useLoginPromptStore.getState().hide();
  });

  it('show() 는 모달을 열고 문구·복귀 경로를 담는다', () => {
    useLoginPromptStore.getState().show({ message: '댓글을 남기려면 로그인해주세요.', returnTo: '/course/1' });
    const s = useLoginPromptStore.getState();
    expect(s.isOpen).toBe(true);
    expect(s.message).toBe('댓글을 남기려면 로그인해주세요.');
    expect(s.returnTo).toBe('/course/1');
  });

  it('show() 를 인자 없이 부르면 이전 문구를 지우고 기본 문구로 돌아간다', () => {
    useLoginPromptStore.getState().show({ message: '이전 문구' });
    useLoginPromptStore.getState().show();
    const s = useLoginPromptStore.getState();
    expect(s.isOpen).toBe(true);
    expect(s.message).toBeNull();
    expect(s.returnTo).toBeNull();
  });

  it('hide() 는 모달만 닫는다', () => {
    useLoginPromptStore.getState().show({ message: 'x' });
    useLoginPromptStore.getState().hide();
    expect(useLoginPromptStore.getState().isOpen).toBe(false);
  });
});
