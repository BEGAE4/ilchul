"use client";

import React, { useState } from "react";
import { Map, Search, Hexagon, Smile, Circle } from "lucide-react";
import { TabBarProps } from "./types";
import styles from "./style.module.scss";

const defaultItems = [
  { icon: Map, label: "지도" },
  { icon: Search, label: "검색" },
  { icon: Hexagon, label: "육각형" },
  { icon: Smile, label: "스마일" },
  { icon: Circle, label: "원형" },
];

const TabBar: React.FC<TabBarProps> = ({
  items = defaultItems,
  activeIndex: controlledActiveIndex,
  onTabChange,
  className = "",
}) => {
  const [internalActiveIndex, setInternalActiveIndex] = useState(3);
  
  const activeIndex = controlledActiveIndex !== undefined ? controlledActiveIndex : internalActiveIndex;
  
  const handleTabClick = (index: number) => {
    if (controlledActiveIndex === undefined) {
      setInternalActiveIndex(index);
    }
    onTabChange?.(index);
  };

  return (
    <nav className={`${styles.nav} ${className}`}>
      {items.map(({ icon: Icon, label }, idx) => (
        <button
          key={label}
          className={styles.tab}
          aria-label={label}
          type="button"
          onClick={() => handleTabClick(idx)}
        >
          <Icon
            size={28}
            strokeWidth={2}
            className={`${styles.icon} ${
              idx === activeIndex ? styles.active : styles.inactive
            }`}
          />
          <div
            className={`${styles.indicator} ${
              idx === activeIndex ? styles.active : styles.inactive
            }`}
          />
        </button>
      ))}
    </nav>
  );
};

export default TabBar;
