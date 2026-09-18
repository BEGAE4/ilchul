'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/shared/lib/stores/useUserStore';

interface RequireAuthOptions {
  // true 면 로그인에 더해 관리자 권한(ROLE_ADMIN)까지 요구한다. 일반 계정은 홈으로 보낸다.
  adminOnly?: boolean;
}

// 로그인이 필요한 페이지 가드
// 로그인 여부 확인(useAuth) 완료 후 미로그인 상태면 /login 으로 이동.
// 확인이 끝나기 전(authChecked=false)에는 아무 판단도 하지 않는다 — 초기값(isLoggedIn=false)으로
// 먼저 튕기면 로그인 사용자도 직접 진입·새로고침 시 /login → / 로 돌아가 버린다.
export const useRequireAuth = (options: RequireAuthOptions = {}) => {
  const { adminOnly = false } = options;
  const router = useRouter();
  const authChecked = useUserStore((state) => state.authChecked);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const isAdmin = useUserStore((state) => state.user.isAdmin ?? false);

  const allowed = authChecked && isLoggedIn && (!adminOnly || isAdmin);

  useEffect(() => {
    if (!authChecked) return;
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }
    if (adminOnly && !isAdmin) {
      router.replace('/');
    }
  }, [authChecked, isLoggedIn, isAdmin, adminOnly, router]);

  // authChecked=false: 확인 중 / ready: 접근 허용
  return { authChecked, isLoggedIn, isAdmin, ready: allowed };
};
