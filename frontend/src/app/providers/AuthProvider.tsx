'use client';

import { useAuth } from '@/features/authentication/hooks';
import { LoginPromptModal } from '@/shared/ui/LoginPromptModal';

// 앱 전역에서 로그인 여부 확인을 1회 수행하는 클라이언트 프로바이더.
// 로그인 유도 모달도 여기서 한 번만 마운트한다 (useLoginPromptStore.show 로 어디서든 연다).
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth();
  return (
    <>
      {children}
      <LoginPromptModal />
    </>
  );
}
