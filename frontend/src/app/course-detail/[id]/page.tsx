'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CourseDetailPage } from '@/features/course-detail/components/CourseDetailPage';

export default function CourseDetail() {
  const params = useParams();
  const courseId = params.id as string;

  return <CourseDetailPage courseId={courseId} />;
}
