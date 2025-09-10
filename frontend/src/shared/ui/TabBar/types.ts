import { IconName } from "../IconBox/types";

export interface TabItem {
  icon: IconName;
  label: string;
}

export interface TabBarProps {
  items?: TabItem[];
  activeIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
}
