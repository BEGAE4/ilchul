'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { markInAppNavigation } from '@/shared/lib/navigation/inAppHistory';
import styles from './styles.module.scss';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * 프레임을 적용하지 않는 라우트.
 * /admin은 사이드바를 갖는 데스크톱 운영자 콘솔이라 모바일 폭에 가두면 레이아웃이 깨진다.
 */
const UNFRAMED_PREFIXES = ['/admin'];

/**
 * 모든 화면을 --container-app 폭으로 통일하는 앱 프레임. 폰에서는 화면을 꽉 채운다.
 * position: fixed 요소는 이 프레임을 벗어나므로 globals.css의 `app-frame` 유틸리티를 함께 쓴다.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // 처음 들어온 화면 이후로 경로가 바뀌면 "앱 안에서 이동한 기록이 있다"고 남긴다 (goBackOrHome 참고)
  const firstPathnameRef = useRef(pathname);
  useEffect(() => {
    if (pathname !== firstPathnameRef.current) markInAppNavigation();
  }, [pathname]);

  const isUnframed = UNFRAMED_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  if (isUnframed) {
    return <>{children}</>;
  }

  return <div className={styles.shell}>{children}</div>;
}
