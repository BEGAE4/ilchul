import { CourseViewPage } from '@/features/course-detail/components/CourseViewPage';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params;
  return <CourseViewPage courseId={id} />;
}
