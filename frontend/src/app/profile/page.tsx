'use client';

import { ProfilePage } from '@/features/profile/components/ProfilePage';
import { RequireAuth } from '@/features/authentication/components/RequireAuth';
import PageLayout from '@/shared/ui/PageLayout';
import { useBottomNavItems } from '@/shared/hooks/useBottomNavItems';

export default function ProfileRoute() {
  const navItems = useBottomNavItems('profile');

  return (
    <RequireAuth>
      <PageLayout bottomNavItems={navItems}>
        <ProfilePage />
      </PageLayout>
    </RequireAuth>
  );
}
