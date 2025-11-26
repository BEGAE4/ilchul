'use client';

export default function CourseDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="course-detail-error-container">
      <h2>코스 정보를 불러오는데 실패했습니다</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>다시 시도</button>
    </div>
  );
}
