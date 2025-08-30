import React from "react";

export interface TabItem {
  icon: React.ComponentType<any>;
  label: string;
}

export interface TabBarProps {
  items?: TabItem[];
  activeIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
}
