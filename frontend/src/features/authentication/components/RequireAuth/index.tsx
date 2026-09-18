'use client';

import type { ReactNode } from 'react';
import { useRequireAuth } from '@/features/authentication/hooks';

interface RequireAuthProps {
  children: ReactNode;
  // 관리자 전용 영역(/admin) — 일반 계정은 홈으로 보낸다
  adminOnly?: boolean;
  // 로그인 확인이 끝나기 전에 보여줄 내용 (기본: 아무것도 표시하지 않음)
  fallback?: ReactNode;
}

// 로그인(또는 관리자) 필요 라우트를 감싸는 가드.
// 서버 컴포넌트 page.tsx 에서도 그대로 감쌀 수 있도록 클라이언트 컴포넌트로 분리했다.
// 허용되기 전에는 children 을 렌더하지 않아, 보호 페이지의 API 호출이 401 로 실패하며
// 빈 화면·에러가 먼저 그려지는 일이 없다.
export function RequireAuth({ children, adminOnly = false, fallback = null }: RequireAuthProps) {
  const { ready } = useRequireAuth({ adminOnly });
  if (!ready) return <>{fallback}</>;
  return <>{children}</>;
}
