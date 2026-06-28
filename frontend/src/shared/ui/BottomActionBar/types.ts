import type { LucideIcon } from 'lucide-react';

export type BottomActionBarActiveTone = 'default' | 'like' | 'bookmark';

export interface BottomActionBarIconAction {
  id: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  activeTone?: BottomActionBarActiveTone;
  filled?: boolean;
  onClick: () => void;
}

export interface BottomActionBarProps {
  iconActions: BottomActionBarIconAction[];
  primaryLabel: string;
  primaryIcon?: LucideIcon;
  onPrimaryClick: () => void;
  className?: string;
}
