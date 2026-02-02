'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/shared/ui/PageLayout';
import Header from '@/shared/ui/Header';
import Button from '@/shared/ui/Button';
import styles from './result.module.scss';

const SurveyResultPage: React.FC = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const handleNextClick = () => {
    // 추천 코스 상세 페이지로 이동
    router.push('/course-plan/survey/result/detail');
  };

  // TODO: 실제 설문 결과 데이터로 교체 필요
  const resultData = {
    userName: '일출',
    type: '탈출형',
    description: '현재에서 벗어나고 싶은 충동적 휴식',
    // 임시 이미지 URL - 실제 이미지가 준비되면 교체 필요
    imageUrl:
      'http://localhost:3845/assets/1982e394c34908f40d9369eb7f1e3a7fe2b56f32.png',
  };

  return (
    <div className={styles.pageWrapper}>
      <PageLayout>
        <Header variant="backArrow" />

        <div className={styles.content}>
          <div className={styles.textSection}>
            <p className={styles.subtitle}>
              결과를 기반으로 필요한 힐링을 추천해드릴게요.
            </p>
            <h1 className={styles.title}>
              현재 '{resultData.userName}'님의 상태는
            </h1>
          </div>

          <div className={styles.resultCard}>
            <div className={styles.imageContainer}>
              <img
                src={resultData.imageUrl}
                alt={resultData.type}
                className={styles.resultImage}
              />
            </div>
            <div className={styles.typeSection}>
              <h2 className={styles.typeTitle}>{resultData.type}</h2>
            </div>
            <div className={styles.descriptionSection}>
              <p className={styles.typeDescription}>{resultData.description}</p>
            </div>
          </div>
        </div>

        <div className={styles.buttonSection}>
          <Button
            variant="primary"
            size="large"
            onClick={handleNextClick}
            className={styles.nextButton}
          >
            추천 코스 보기
          </Button>
        </div>
      </PageLayout>
    </div>
  );
};

export default SurveyResultPage;
