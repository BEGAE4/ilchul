'use client';

import { useRouter } from 'next/navigation';
import { ProfilePage } from '@/features/profile/components/ProfilePage';
import PageLayout from '@/shared/ui/PageLayout';
import { getNavItems } from '@/shared/lib/constants/navItems';
import { useRequireAuth } from '@/features/authentication/hooks';

export default function ProfileRoute() {
  const router = useRouter();
  const navItems = getNavItems('profile', (path) => router.push(path));

  // 로그인 여부 확인(useAuth)이 끝난 뒤에만 가드를 판단한다.
  // 확인 전 초기값(isLoggedIn=false)으로 즉시 /login 으로 보내면 로그인 사용자도
  // 직접 진입·새로고침 시 /login → / 로 튕긴다 (QA A #2).
  const { authChecked, isLoggedIn } = useRequireAuth();

  if (!authChecked || !isLoggedIn) {
    return null;
  }

  return (
    <PageLayout bottomNavItems={navItems}>
      <ProfilePage />
    </PageLayout>
  );
}
