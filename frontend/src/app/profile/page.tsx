'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfilePage } from '@/features/profile/components/ProfilePage';
import PageLayout from '@/shared/ui/PageLayout';
import { getNavItems } from '@/shared/lib/constants/navItems';
import { useUserStore } from '@/shared/lib/stores/useUserStore';

export default function ProfileRoute() {
  const router = useRouter();
  const { isLoggedIn } = useUserStore();
  const navItems = getNavItems('profile', (path) => router.push(path));

  // 비로그인 상태로 마이페이지 진입 시 로그인 페이지로 이동
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <PageLayout bottomNavItems={navItems}>
      <ProfilePage />
    </PageLayout>
  );
}
