"use client";

import React, { useState } from "react";
import IconBox from "../IconBox";
import { TabBarProps } from "./types";
import { IconName } from "../IconBox/types";
import styles from "./styles.module.scss";

const defaultItems: { icon: IconName; label: string }[] = [
  { icon: "map", label: "지도" },
  { icon: "search", label: "검색" },
  { icon: "heart", label: "육각형" },
  { icon: "smile", label: "스마일" },
  { icon: "circle-check", label: "원형" },
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
      {items.map(({ icon, label }, idx) => (
        <button
          key={label}
          className={styles.tab}
          aria-label={label}
          type="button"
          onClick={() => handleTabClick(idx)}
        >
          <IconBox
            name={icon}
            size={28}
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
