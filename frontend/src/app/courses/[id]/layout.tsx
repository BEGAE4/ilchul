export default function CourseDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="course-detail-layout">
      <header>
        <h1>코스 상세</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
