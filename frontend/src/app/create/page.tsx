'use client';

import { CourseCreationFlow } from '@/features/course-creation/components/CourseCreationFlow';
import { RequireAuth } from '@/features/authentication/components/RequireAuth';
import PageLayout from '@/shared/ui/PageLayout';

export default function CreateRoute() {
  return (
    <RequireAuth>
      <PageLayout>
        <CourseCreationFlow />
      </PageLayout>
    </RequireAuth>
  );
}
