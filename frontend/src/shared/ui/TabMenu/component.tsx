'use client';

import React from 'react';
import { TabMenuProps } from './types';
import styles from './styles.module.scss';

export function TabMenu({
  tabs,
  activeTabId,
  onTabChange,
  className = '',
  size = 'medium',
  variant = 'default',
  fullWidth = false,
  disabled = false,
  'aria-label': ariaLabel = '탭 메뉴'
}: TabMenuProps) {
  return (
    <div 
      className={`${styles.tabMenu} ${styles[size]} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tabItem} ${
            tab.id === activeTabId ? styles.active : ''
          } ${tab.disabled || disabled ? styles.disabled : ''}`}
          onClick={() => !tab.disabled && !disabled && onTabChange(tab.id)}
          disabled={tab.disabled || disabled}
          role="tab"
          aria-selected={tab.id === activeTabId}
          aria-disabled={tab.disabled || disabled}
        >
          {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
          <span className={styles.tabLabel}>{tab.label}</span>
          {tab.id === activeTabId && <div className={styles.tabUnderline} />}
        </button>
      ))}
    </div>
  );
};