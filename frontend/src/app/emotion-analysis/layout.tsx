export default function EmotionAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="emotion-analysis-layout">
      <header className="emotion-analysis-header">
        <h1>감정 분석</h1>
        <nav>
          <a href="/emotion-analysis">분석하기</a>
          <a href="/emotion-analysis/history">분석 기록</a>
        </nav>
      </header>
      <main className="emotion-analysis-main">
        {children}
      </main>
    </div>
  );
}
