export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="community-layout">
      <header className="community-header">
        <h1>커뮤니티</h1>
        <nav>
          <a href="/community">전체 게시글</a>
          <a href="/community/popular">인기 게시글</a>
          <a href="/community/write">글쓰기</a>
        </nav>
      </header>
      <main className="community-main">
        {children}
      </main>
    </div>
  );
}
