'use client';

import { use } from 'react';
import { CourseDetailPage } from '@/features/search/components/CourseDetailPage';
import { MOCK_COURSES } from '@/shared/data/mockData';
import PageLayout from '@/shared/ui/PageLayout';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailRoute({ params }: PageProps) {
  const { id } = use(params);
  const course = MOCK_COURSES.find((c) => c.id === id);

  if (!course) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen text-gray-500">
          코스를 찾을 수 없습니다.
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <CourseDetailPage course={course} />
    </PageLayout>
  );
}
