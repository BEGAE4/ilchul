'use client';

import React from 'react';
import type { BottomActionBarActiveTone, BottomActionBarProps } from './types';
import styles from './styles.module.scss';

function getActiveClassName(tone: BottomActionBarActiveTone = 'default') {
  switch (tone) {
    case 'like':
      return styles.iconButtonActiveLike;
    case 'bookmark':
      return styles.iconButtonActiveBookmark;
    default:
      return styles.iconButtonActiveDefault;
  }
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  iconActions,
  primaryLabel,
  primaryIcon: PrimaryIcon,
  onPrimaryClick,
  className = '',
}) => {
  return (
    <div className={`${styles.bar} ${className}`} role="toolbar" aria-label="하단 액션">
      <div className={styles.pill}>
        {iconActions.map(
          ({ id, icon: Icon, label, active, activeTone, filled, onClick }) => (
            <button
              key={id}
              type="button"
              className={`${styles.iconButton} ${active ? getActiveClassName(activeTone) : ''}`}
              aria-label={label}
              aria-pressed={active}
              onClick={onClick}
            >
              <Icon aria-hidden="true" size={20} className={active && filled ? 'fill-current' : ''} />
              <span className={styles.iconLabel}>{label}</span>
            </button>
          )
        )}
        <button type="button" className={styles.primaryButton} onClick={onPrimaryClick}>
          {PrimaryIcon && <PrimaryIcon aria-hidden="true" size={18} strokeWidth={3} />}
          <span className={styles.primaryLabel}>{primaryLabel}</span>
        </button>
      </div>
    </div>
  );
};

export default BottomActionBar;
