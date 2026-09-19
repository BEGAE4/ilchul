// 이미지 주소가 브라우저에서 실제로 열리는지 확인한다.
// 업로드 API 가 200 과 주소를 돌려줘도 저장소 권한 문제로 그 주소가 403 일 수 있다
// (2026-09-18 운영: users/profile/ 경로가 AccessDenied). 그대로 두면 "올렸는데 아무 일도 없는" 상태가 된다.
export function canLoadImage(url: string, timeoutMs = 8000): Promise<boolean> {
  if (typeof window === 'undefined' || !url) return Promise.resolve(false);
  return new Promise((resolve) => {
    const img = new Image();
    const timer = window.setTimeout(() => done(false), timeoutMs);
    function done(ok: boolean) {
      window.clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      resolve(ok);
    }
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = url;
  });
}
