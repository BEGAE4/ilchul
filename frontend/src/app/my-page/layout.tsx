'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/shared/ui/Header';
import IconBox from '@/shared/ui/IconBox';
import styles from './my-page.module.scss';

// Header 컴포넌트 (헤더만 담당)
interface MyPageHeaderProps {
  center?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onBack: () => void;
}

const MyPageHeader: React.FC<MyPageHeaderProps> = ({
  center,
  rightIcon,
  onBack
}) => {
  return (
    <div className={styles.headerWrapper}>
      <Header
        leftIcon={
          <IconBox name="arrow-left" size={24} color="rgb(55, 65, 81)" />
        }
        center={center}
        rightIcon={rightIcon}
        onLeftClick={onBack}
        className={styles.header}
      />
    </div>
  );
};

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleBackClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      window.location.href = '/';
    }
  };

  // 경로에 따라 헤더 설정
  const getHeaderConfig = () => {
    if (pathname === '/my-page/course-plan') {
      return {
        center: null,
        rightIcon: null,
      };
    }
    // 기본 마이페이지
    return {
      center: <span className={styles.headerTitle}>마이페이지</span>,
      rightIcon: null,
    };
  };

  const headerConfig = getHeaderConfig();

  return (
    <div className="my-page-layout">
      <MyPageHeader
        center={headerConfig.center}
        rightIcon={headerConfig.rightIcon}
        onBack={handleBackClick}
      />
      <main className="my-page-main">
        {children}
      </main>
    </div>
  );
}
