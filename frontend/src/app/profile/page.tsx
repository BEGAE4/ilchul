'use client';

import { useRouter } from 'next/navigation';
import { ProfilePage } from '@/features/profile/components/ProfilePage';
import PageLayout from '@/shared/ui/PageLayout';
import { getNavItems } from '@/shared/lib/constants/navItems';

export default function ProfileRoute() {
  const router = useRouter();
  const navItems = getNavItems('profile', (path) => router.push(path));

  return (
    <PageLayout bottomNavItems={navItems}>
      <ProfilePage />
    </PageLayout>
  );
}
