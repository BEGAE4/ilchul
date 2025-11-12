interface CourseReviewsPageProps {
  params: {
    id: string;
  };
}

export default function CourseReviewsPage({ params }: CourseReviewsPageProps) {
  return (
    <div>
      <h2>리뷰 - 코스 {params.id}</h2>
      {/* 리뷰 목록 */}
    </div>
  );
}
