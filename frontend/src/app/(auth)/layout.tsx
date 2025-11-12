export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <header className="auth-header">
        <h1>일출</h1>
      </header>
      <main className="auth-main">
        {children}
      </main>
      <footer className="auth-footer">
        <p>일출과 함께하는 특별한 경험</p>
      </footer>
    </div>
  );
}
