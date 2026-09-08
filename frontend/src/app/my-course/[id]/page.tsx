import type { Metadata } from 'next';
import { MyCourseDetailPage } from '@/features/my-course/components/MyCourseDetailPage';

export const metadata: Metadata = {
  title: '나의 플랜 · 일출',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MyCoursePageRoute({ params }: PageProps) {
  const { id } = await params;
  return <MyCourseDetailPage courseId={id} />;
}
