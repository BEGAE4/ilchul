import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 검색 결과의 플랜 상세는 실제 플랜 상세 페이지(/course/[id])로 위임한다.
export default async function CourseDetailRoute({ params }: PageProps) {
  const { id } = await params;
  redirect(`/course/${id}`);
}
