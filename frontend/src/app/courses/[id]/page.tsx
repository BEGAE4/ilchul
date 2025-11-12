interface CourseDetailPageProps {
  params: {
    id: string;
  };
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  return (
    <div>
      <h1>코스 상세 - {params.id}</h1>
      {/* 코스 상세 정보 */}
    </div>
  );
}
