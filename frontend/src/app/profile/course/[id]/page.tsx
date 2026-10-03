import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 구버전 경로. 예전에는 작성자용 화면(MyCourseDetailPage)을 로그인·작성자 확인 없이 그렸는데,
// 비로그인 조회가 열린 뒤로 남의 플랜이 "공개 중·기록 수정" 같은 작성자 화면으로 보였다.
// 누구나 볼 수 있는 플랜 상세(/course/[id])로 보낸다. 작성자는 거기서 내 플랜으로 이동할 수 있다.
export default async function LegacyProfileCourseRoute({ params }: PageProps) {
  const { id } = await params;
  redirect(`/course/${id}`);
}
