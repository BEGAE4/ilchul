'use client';

import { useCallback } from 'react';
import { useUserStore } from '@/shared/lib/stores/useUserStore';
import { useLoginPromptStore } from '@/shared/lib/stores/useLoginPromptStore';

// 로그인이 필요한 기능(댓글·좋아요·스크랩·담기·신고 등)의 진입 게이트.
// 비로그인이면 로그인 유도 모달을 띄우고 false 를, 로그인 상태면 action 을 실행하고 true 를 돌려준다.
// 로그인 확인이 끝나기 전(authChecked=false)에는 막지 않는다 — 앱 진입 직후 잠깐이며,
// 그때 서버가 401 을 주면 각 기능의 실패 처리로 넘어간다.
export const useLoginGate = () => {
  const authChecked = useUserStore((s) => s.authChecked);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const show = useLoginPromptStore((s) => s.show);

  const needsLogin = authChecked && !isLoggedIn;

  const requireLogin = useCallback(
    (action?: () => void, message?: string): boolean => {
      if (needsLogin) {
        show({ message });
        return false;
      }
      action?.();
      return true;
    },
    [needsLogin, show]
  );

  // 로그인 안내만 띄우고 싶을 때 (예: 401 응답을 받은 뒤)
  const promptLogin = useCallback(
    (message?: string, returnTo?: string) => show({ message, returnTo }),
    [show]
  );

  return { isLoggedIn, authChecked, needsLogin, requireLogin, promptLogin };
};
