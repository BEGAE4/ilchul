'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/shared/lib/stores/useUserStore';

// 로그인이 필요한 페이지 가드
// 로그인 여부 확인(useAuth) 완료 후 미로그인 상태면 /login 으로 이동
export const useRequireAuth = () => {
  const router = useRouter();
  const authChecked = useUserStore((state) => state.authChecked);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (authChecked && !isLoggedIn) {
      router.replace('/login');
    }
  }, [authChecked, isLoggedIn, router]);

  // authChecked=false: 확인 중 / (authChecked && isLoggedIn): 접근 허용
  return { authChecked, isLoggedIn, ready: authChecked && isLoggedIn };
};
