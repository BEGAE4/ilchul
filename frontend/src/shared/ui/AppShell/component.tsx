'use client';

import { usePathname } from 'next/navigation';
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
 * 모든 화면을 --container-app(390px) 폭으로 통일하는 앱 프레임.
 * position: fixed 요소는 이 프레임을 벗어나므로 globals.css의 `app-frame` 유틸리티를 함께 쓴다.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isUnframed = UNFRAMED_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  if (isUnframed) {
    return <>{children}</>;
  }

  return <div className={styles.shell}>{children}</div>;
}
