'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/shared/lib/stores/useUserStore';
import { fetchUserInfo } from '../api';

const ADMIN_AUTHORITY = 'ROLE_ADMIN';

// 앱 진입 시 로그인 여부 확인(GET /api/sign/userinfo) → 전역 상태에 반영
// 200: 로그인 상태 (role/email), 401: 미로그인
export const useAuth = () => {
  const setAuthResult = useUserStore((state) => state.setAuthResult);

  useEffect(() => {
    let cancelled = false;

    const checkLoginStatus = async () => {
      try {
        const info = await fetchUserInfo();
        if (cancelled) return;
        const isAdmin = info.role.some((r) => r.authority === ADMIN_AUTHORITY);
        setAuthResult({ isLoggedIn: true, email: info.email, isAdmin });
      } catch {
        // 401 등 응답: 미로그인 상태로 처리
        if (cancelled) return;
        setAuthResult({ isLoggedIn: false, email: null, isAdmin: false });
      }
    };

    checkLoginStatus();

    return () => {
      cancelled = true;
    };
  }, [setAuthResult]);
};
