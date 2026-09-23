'use client';

import { useRouter } from 'next/navigation';
import { getNavItems, type NavTabId } from '@/shared/lib/constants/navItems';
import { useLoginGate } from '@/features/authentication/hooks';

// 하단 탭 4개를 만든다. 플랜생성·마이페이지는 로그인이 필요하므로
// 비로그인 사용자가 누르면 화면을 옮기지 않고 로그인 유도 모달을 띄운다.
// 홈·검색은 비로그인도 그대로 이동한다.
const LOGIN_ONLY_TABS: Record<NavTabId, string | null> = {
  home: null,
  search: null,
  create: '플랜을 만들려면 로그인해주세요.',
  profile: '마이페이지는 로그인 후 볼 수 있어요.',
};

export function useBottomNavItems(activeTab: NavTabId) {
  const router = useRouter();
  const { requireLogin } = useLoginGate();

  return getNavItems(activeTab, (path, tab) => {
    const message = LOGIN_ONLY_TABS[tab];
    if (message) {
      requireLogin(() => router.push(path), message);
      return;
    }
    router.push(path);
  });
}
