import { create } from 'zustand';

// 로그인 유도 모달의 전역 상태.
// 비로그인 사용자가 댓글·좋아요·담기처럼 로그인이 필요한 기능을 누르면 여기로 열고,
// 모달은 AuthProvider 에 한 번만 마운트된다 (shared/ui/LoginPromptModal).
interface LoginPromptState {
  isOpen: boolean;
  // 어떤 기능 때문에 로그인이 필요한지 알려주는 한 줄 (없으면 기본 문구)
  message: string | null;
  // 로그인 완료 후 돌아올 경로 — /login/success 가 읽어 이동한다
  returnTo: string | null;
  show: (options?: { message?: string; returnTo?: string | null }) => void;
  hide: () => void;
}

export const DEFAULT_LOGIN_PROMPT_MESSAGE = '이 기능은 로그인 후 이용할 수 있어요.';

export const useLoginPromptStore = create<LoginPromptState>((set) => ({
  isOpen: false,
  message: null,
  returnTo: null,
  show: (options = {}) =>
    set({
      isOpen: true,
      message: options.message ?? null,
      returnTo: options.returnTo ?? null,
    }),
  hide: () => set({ isOpen: false }),
}));
