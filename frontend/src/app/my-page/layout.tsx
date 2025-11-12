export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="my-page-layout">
      <header className="my-page-header">
        <h1>마이페이지</h1>
        <nav>
          <a href="/my-page">프로필</a>
          <a href="/my-page/settings">설정</a>
          <a href="/my-page/achievements">성취</a>
        </nav>
      </header>
      <main className="my-page-main">
        {children}
      </main>
    </div>
  );
}
