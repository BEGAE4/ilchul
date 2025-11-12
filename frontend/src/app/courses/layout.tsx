export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="courses-layout">
      <header className="courses-header">
        <h1>일출 코스</h1>
        <nav>
          <a href="/courses">전체 코스</a>
          <a href="/courses/recommended">추천 코스</a>
        </nav>
      </header>
      <main className="courses-main">
        {children}
      </main>
    </div>
  );
}
