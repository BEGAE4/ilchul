import React from 'react';
import BottomNavigation, { type NavItem } from '../BottomNavigation';
import styles from './styles.module.scss';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  bottomNavItems?: NavItem[];
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = '',
  bottomNavItems,
}) => {
  return (
    <div className={`${styles.page} ${className}`}>
      <div className={styles.container}>
        {children}
        {bottomNavItems && <BottomNavigation items={bottomNavItems} />}
      </div>
    </div>
  );
};

export default PageLayout;
