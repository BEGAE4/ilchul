import { Home, Search, PlusSquare, User } from 'lucide-react';
import type { NavItem } from '@/shared/ui/BottomNavigation';

type TabId = 'home' | 'search' | 'create' | 'profile';

const TAB_ROUTES: Record<TabId, string> = {
  home: '/',
  search: '/search',
  create: '/create',
  profile: '/profile',
};

export const getNavItems = (
  activeTab: string,
  onNavigate: (path: string) => void
): NavItem[] => [
  {
    id: 'home',
    label: '홈',
    icon: Home,
    active: activeTab === 'home',
    onClick: () => onNavigate(TAB_ROUTES.home),
  },
  {
    id: 'search',
    label: '검색',
    icon: Search,
    active: activeTab === 'search',
    onClick: () => onNavigate(TAB_ROUTES.search),
  },
  {
    id: 'create',
    label: '코스작성',
    icon: PlusSquare,
    active: activeTab === 'create',
    onClick: () => onNavigate(TAB_ROUTES.create),
  },
  {
    id: 'profile',
    label: '마이',
    icon: User,
    active: activeTab === 'profile',
    onClick: () => onNavigate(TAB_ROUTES.profile),
  },
];
