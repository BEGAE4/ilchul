'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { SearchResultsPage } from '@/features/search/components/SearchResultsPage';
import PageLayout from '@/shared/ui/PageLayout';
import { getNavItems } from '@/shared/lib/constants/navItems';

function SearchResultsContent() {
  return <SearchResultsPage />;
}

export default function SearchResultsRoute() {
  const router = useRouter();
  const navItems = getNavItems('search', (path) => router.push(path));

  return (
    <PageLayout bottomNavItems={navItems}>
      <Suspense fallback={<div className="p-4 text-center text-gray-400">로딩 중...</div>}>
        <SearchResultsContent />
      </Suspense>
    </PageLayout>
  );
}
