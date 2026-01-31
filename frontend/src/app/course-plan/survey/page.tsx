'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/shared/ui/PageLayout';
import Header from '@/shared/ui/Header';
import Button from '@/shared/ui/Button';
import styles from './survey.module.scss';

const SurveyStartPage: React.FC = () => {
  const router = useRouter();

  const handleStartClick = () => {
    // 설문 시작 - 다음 단계로 이동
    router.push('/course-plan/survey/questions');
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className={styles.pageWrapper}>
      <PageLayout>
        <Header variant="backArrow" onBackClick={handleBackClick} />

        <div className={styles.content}>
          <div className={styles.textSection}>
            <h1 className={styles.title}>
              지금 가장 나에게 어울리는
              <br />
              힐링 방법이 뭔지 알아볼까요 ;)
            </h1>
            <p className={styles.description}>
              먼저, 일출님을 파악하고, 일출님에게 필요한 힐링 플랜을
              <br />
              추천해드릴게요.
            </p>
          </div>

          <div className={styles.graphicSection}>
            <div className={styles.graphic}>
              <div className={styles.shape1} />
              <div className={styles.shape2} />
              <div className={styles.shape3} />
              <div className={styles.shape4} />
              <div className={styles.shape5} />
            </div>
          </div>
        </div>

        <div className={styles.buttonSection}>
          <Button
            variant="primary"
            size="large"
            onClick={handleStartClick}
            className={styles.startButton}
          >
            시작하기
          </Button>
        </div>
      </PageLayout>
    </div>
  );
};

export default SurveyStartPage;
