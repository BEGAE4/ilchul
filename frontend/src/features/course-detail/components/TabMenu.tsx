import React from 'react';
import styles from './TabMenu.module.scss';

interface Tab {
  id: string;
  label: string;
}

interface TabMenuProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabMenu: React.FC<TabMenuProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  return (
    <div className={styles.tabMenu}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
