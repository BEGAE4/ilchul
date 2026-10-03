// "뒤로가기"를 눌렀을 때 돌아갈 앱 안의 화면이 있는지 판별한다.
//
// 공유 링크·새 탭으로 상세 화면에 바로 들어오면 router.back() 이 돌아갈 곳이 없어 아무 반응이 없거나
// 앱 밖(빈 탭·이전 사이트)으로 나간다. 상세 화면에는 하단 탭도 없어 홈으로 갈 방법이 사라진다.
// window.history.length 는 새 탭의 빈 페이지·이전 사이트까지 세므로(> 1) 이 판별에 쓸 수 없다.
//
// 1) Navigation API 가 있으면 navigation.canGoBack 을 쓴다 — 같은 출처의 이전 기록이 있을 때만 true.
// 2) 없으면(구형 브라우저) 이 탭에서 앱 안 이동이 한 번이라도 있었는지를 세션에 기억해 쓴다.
//    새로고침해도 유지되고, 링크로 새 탭을 열면 비어 있다.

const KEY = 'ilchul:in-app-navigated';

let navigatedInMemory = false;

interface NavigationLike {
  canGoBack?: unknown;
}

function readNavigationApi(): boolean | null {
  const nav = (window as unknown as { navigation?: NavigationLike }).navigation;
  return nav && typeof nav.canGoBack === 'boolean' ? nav.canGoBack : null;
}

/** 앱 안에서 화면을 옮겼음을 기록한다 (AppShell 이 경로가 바뀔 때마다 호출) */
export function markInAppNavigation(): void {
  navigatedInMemory = true;
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* 저장 불가 환경에서는 메모리 값만 쓴다 */
  }
}

export function canGoBackInApp(): boolean {
  if (typeof window === 'undefined') return false;
  const fromApi = readNavigationApi();
  if (fromApi !== null) return fromApi;
  if (navigatedInMemory) return true;
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

interface BackRouter {
  back: () => void;
  replace: (href: string) => void;
}

/** 돌아갈 앱 화면이 있으면 뒤로, 없으면 fallback(기본 홈)으로 보낸다 */
export function goBackOrHome(router: BackRouter, fallback = '/'): void {
  if (canGoBackInApp()) router.back();
  else router.replace(fallback);
}
