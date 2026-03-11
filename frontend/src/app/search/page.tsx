'use client';

import { useRouter } from 'next/navigation';
import { SearchPage as SearchPageComponent } from '@/features/search/components/SearchPage';
import PageLayout from '@/shared/ui/PageLayout';
import { getNavItems } from '@/shared/lib/constants/navItems';

export default function SearchRoute() {
  const router = useRouter();
  const navItems = getNavItems('search', (path) => router.push(path));

  return (
    <PageLayout bottomNavItems={navItems}>
      <SearchPageComponent />
    </PageLayout>
  );
}
