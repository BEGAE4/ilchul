'use client';

import { useAuth } from '@/features/authentication/hooks';

// 앱 전역에서 로그인 여부 확인을 1회 수행하는 클라이언트 프로바이더
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth();
  return <>{children}</>;
}
