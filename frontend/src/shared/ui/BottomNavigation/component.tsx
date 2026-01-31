'use client';

import React from 'react';
import { BottomNavigationProps } from './types';
import styles from './styles.module.scss';

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  className = '',
}) => {
  return (
    <nav
      className={`${styles.bottomNavigation} ${className}`}
      aria-label="하단 내비게이션"
    >
      <div className={styles.navIcons}>
        {items.map(({ id, label, icon: Icon, active, onClick }) => (
          <button
            key={id}
            type="button"
            className={`${styles.navIcon} ${active ? styles.navIconActive : ''}`}
            aria-label={label}
            onClick={onClick}
          >
            <Icon aria-hidden="true" size={22} />
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
