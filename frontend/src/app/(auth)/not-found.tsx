export default function AuthNotFound() {
  return (
    <div className="auth-not-found-container">
      <h2>인증 페이지를 찾을 수 없습니다</h2>
      <p>요청하신 인증 페이지가 존재하지 않습니다.</p>
      <a href="/login">로그인 페이지로</a>
    </div>
  );
}
