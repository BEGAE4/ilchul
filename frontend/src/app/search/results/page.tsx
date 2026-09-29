'use client';

import { Suspense } from 'react';
import { SearchResultsPage } from '@/features/search/components/SearchResultsPage';
import PageLayout from '@/shared/ui/PageLayout';
import { useBottomNavItems } from '@/shared/hooks/useBottomNavItems';

function SearchResultsContent() {
  return <SearchResultsPage />;
}

export default function SearchResultsRoute() {
  const navItems = useBottomNavItems('search');

  return (
    <PageLayout bottomNavItems={navItems}>
      <Suspense fallback={<div className="p-4 text-center text-gray-400">로딩 중...</div>}>
        <SearchResultsContent />
      </Suspense>
    </PageLayout>
  );
}
