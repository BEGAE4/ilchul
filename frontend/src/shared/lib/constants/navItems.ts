import { Home, Search, PlusSquare, User } from 'lucide-react';
import type { NavItem } from '@/shared/ui/BottomNavigation';

export type NavTabId = 'home' | 'search' | 'create' | 'profile';

const TAB_ROUTES: Record<NavTabId, string> = {
  home: '/',
  search: '/search',
  create: '/create',
  profile: '/profile',
};

// 화면에서는 보통 useBottomNavItems(shared/hooks) 를 쓴다 — 로그인이 필요한 탭의 게이트까지 포함한다.
export const getNavItems = (
  activeTab: string,
  onNavigate: (path: string, tab: NavTabId) => void
): NavItem[] => [
  {
    id: 'home',
    label: '홈',
    icon: Home,
    active: activeTab === 'home',
    onClick: () => onNavigate(TAB_ROUTES.home, 'home'),
  },
  {
    id: 'search',
    label: '검색',
    icon: Search,
    active: activeTab === 'search',
    onClick: () => onNavigate(TAB_ROUTES.search, 'search'),
  },
  {
    id: 'create',
    label: '플랜생성',
    icon: PlusSquare,
    active: activeTab === 'create',
    onClick: () => onNavigate(TAB_ROUTES.create, 'create'),
  },
  {
    id: 'profile',
    label: '마이페이지',
    icon: User,
    active: activeTab === 'profile',
    onClick: () => onNavigate(TAB_ROUTES.profile, 'profile'),
  },
];
