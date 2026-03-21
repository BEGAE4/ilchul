'use client';

import { CourseCreationFlow } from '@/features/course-creation/components/CourseCreationFlow';
import PageLayout from '@/shared/ui/PageLayout';

export default function CreateRoute() {
  return (
    <PageLayout>
      <CourseCreationFlow />
    </PageLayout>
  );
}
