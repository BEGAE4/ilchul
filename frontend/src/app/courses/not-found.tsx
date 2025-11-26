export default function CoursesNotFound() {
  return (
    <div className="courses-not-found-container">
      <h2>코스를 찾을 수 없습니다</h2>
      <p>요청하신 코스가 존재하지 않습니다.</p>
      <a href="/courses">코스 목록으로</a>
    </div>
  );
}
