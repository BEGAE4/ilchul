'use client';

import { use } from 'react';
import { MyCourseDetailPage } from '@/features/my-course/components/MyCourseDetailPage';
import PageLayout from '@/shared/ui/PageLayout';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MyCourseDetailRoute({ params }: PageProps) {
  const { id } = use(params);
  return (
    <PageLayout>
      <MyCourseDetailPage courseId={id} />
    </PageLayout>
  );
}
