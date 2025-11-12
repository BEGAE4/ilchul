export default function HealingDiaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="healing-diary-layout">
      <header className="healing-diary-header">
        <h1>힐링 다이어리</h1>
        <nav>
          <a href="/healing-diary">내 다이어리</a>
          <a href="/healing-diary/write">글쓰기</a>
          <a href="/healing-diary/calendar">달력 보기</a>
        </nav>
      </header>
      <main className="healing-diary-main">
        {children}
      </main>
    </div>
  );
}
