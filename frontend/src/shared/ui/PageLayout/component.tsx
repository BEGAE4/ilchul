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
      {/* data-scroll-container: useScrollRestoration 이 스크롤 위치를 저장/복원하는 대상 */}
      <div className={styles.container} data-scroll-container>
        {children}
        {bottomNavItems && <BottomNavigation items={bottomNavItems} />}
      </div>
    </div>
  );
};

export default PageLayout;
