import { MyCourseDetailPage } from '@/features/my-course/components/MyCourseDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MyCoursePageRoute({ params }: PageProps) {
  const { id } = await params;
  return <MyCourseDetailPage courseId={id} />;
}
