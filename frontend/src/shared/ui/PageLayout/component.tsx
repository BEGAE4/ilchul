import React from 'react';
import styles from './styles.module.scss';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`${styles.page} ${className}`}>
      <div className={styles.container}>{children}</div>
    </div>
  );
};

export default PageLayout;

