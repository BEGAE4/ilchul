'use client';

import { useEffect } from 'react';
import { useAuth } from '@/features/authentication/hooks';
import { setupAuthInterceptor } from '@/features/authentication/api';

// 앱 전역에서 로그인 여부 확인을 1회 수행하는 클라이언트 프로바이더
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 로그인 확인(useAuth)보다 먼저 재발급 인터셉터를 등록한다.
  useEffect(() => {
    setupAuthInterceptor();
  }, []);

  useAuth();
  return <>{children}</>;
}
