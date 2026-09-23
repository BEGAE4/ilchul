'use client';

import { SearchPage as SearchPageComponent } from '@/features/search/components/SearchPage';
import PageLayout from '@/shared/ui/PageLayout';
import { useBottomNavItems } from '@/shared/hooks/useBottomNavItems';

export default function SearchRoute() {
  const navItems = useBottomNavItems('search');

  return (
    <PageLayout bottomNavItems={navItems}>
      <SearchPageComponent />
    </PageLayout>
  );
}
