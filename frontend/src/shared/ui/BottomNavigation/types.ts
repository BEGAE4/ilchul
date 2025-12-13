import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}

export interface BottomNavigationProps {
  items: NavItem[];
  className?: string;
}

