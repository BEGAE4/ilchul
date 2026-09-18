'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/shared/ui/Header';
import styles from './my-page.module.scss';

// Header 컴포넌트 (헤더만 담당)
interface MyPageHeaderProps {
  center?: React.ReactNode;
  onBack: () => void;
}

const MyPageHeader: React.FC<MyPageHeaderProps> = ({ center, onBack }) => {
  return (
    <div className={styles.headerWrapper}>
      <Header
        variant="backArrow"
        onBackClick={onBack}
        className={styles.header}
      />
      {center && <div className={styles.headerCenter}>{center}</div>}
    </div>
  );
};

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleBackClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      window.location.href = '/';
    }
  };

  // 현재 이 레이아웃은 신고 상세(/my-page/reports/[reportId])에서만 쓰인다.
  // (구버전 /my-page, /my-page/course-plan, /my-page/sanctions 라우트는 제거됨 — QA P-03)
  return (
    <div className="my-page-layout">
      <MyPageHeader
        center={<span className={styles.headerTitle}>마이페이지</span>}
        onBack={handleBackClick}
      />
      <main className="my-page-main">{children}</main>
    </div>
  );
}
