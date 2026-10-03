/** @jest-environment jsdom */
// 모듈 안에 "이동한 적 있음" 메모리 값이 있어 테스트마다 모듈을 새로 불러온다
async function load(): Promise<typeof import('./inAppHistory')> {
  jest.resetModules();
  return import('./inAppHistory');
}

function setNavigationApi(canGoBack: boolean | undefined): void {
  Object.defineProperty(window, 'navigation', {
    configurable: true,
    value: canGoBack === undefined ? undefined : { canGoBack },
  });
}

function makeRouter() {
  return { back: jest.fn(), replace: jest.fn() };
}

describe('inAppHistory', () => {
  beforeEach(() => {
    sessionStorage.clear();
    setNavigationApi(undefined);
  });

  describe('Navigation API 가 있으면 canGoBack 을 따른다', () => {
    it('이전 기록이 없으면(링크로 바로 들어옴) 홈으로 보낸다', async () => {
      setNavigationApi(false);
      const { goBackOrHome, markInAppNavigation } = await load();
      // 세션 표시가 있어도 브라우저가 판단한 값을 우선한다
      markInAppNavigation();
      const router = makeRouter();
      goBackOrHome(router);
      expect(router.replace).toHaveBeenCalledWith('/');
      expect(router.back).not.toHaveBeenCalled();
    });

    it('이전 기록이 있으면 뒤로 간다', async () => {
      setNavigationApi(true);
      const { goBackOrHome } = await load();
      const router = makeRouter();
      goBackOrHome(router);
      expect(router.back).toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  describe('Navigation API 가 없으면 앱 안 이동 기록으로 판단한다', () => {
    it('이동한 적이 없으면 fallback 으로 보낸다', async () => {
      const { goBackOrHome } = await load();
      const router = makeRouter();
      goBackOrHome(router, '/search');
      expect(router.replace).toHaveBeenCalledWith('/search');
    });

    it('이동을 기록하면 뒤로 간다', async () => {
      const { goBackOrHome, markInAppNavigation } = await load();
      markInAppNavigation();
      const router = makeRouter();
      goBackOrHome(router);
      expect(router.back).toHaveBeenCalled();
    });

    it('새로고침(모듈 재로딩) 후에도 세션 기록으로 뒤로 간다', async () => {
      (await load()).markInAppNavigation();
      const { canGoBackInApp } = await load();
      expect(canGoBackInApp()).toBe(true);
    });
  });
});
