'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/shared/ui/PageLayout';
import Header from '@/shared/ui/Header';
import styles from './questions.module.scss';

const SurveyQuestionsPage: React.FC = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <PageLayout>
      <Header variant="withTitle" title="설문" onLeftClick={handleBackClick} />

      <div className={styles.content}>
        <p className={styles.placeholder}>
          설문 질문 페이지는 추후 구현 예정입니다.
        </p>
      </div>
    </PageLayout>
  );
};

export default SurveyQuestionsPage;
