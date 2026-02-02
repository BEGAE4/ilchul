'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/shared/ui/PageLayout';
import Header from '@/shared/ui/Header';
import IconBox from '@/shared/ui/IconBox';
import styles from './detail.module.scss';

interface Course {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

const SurveyResultDetailPage: React.FC = () => {
  const router = useRouter();
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(
    new Set(['1'])
  ); // 첫 번째 코스는 기본 선택

  // TODO: 실제 API에서 데이터를 가져와야 함
  const courses: Course[] = [
    {
      id: '1',
      title: '무계획 기차여행',
      subtitle: '아산 외암마을 도착',
      imageUrl:
        'http://localhost:3845/assets/16e10b05c0ff742cef600c351c6433519cb37f8a.png',
    },
    {
      id: '2',
      title: '무계획 기차여행',
      subtitle: '아산 외암마을 도착',
      imageUrl:
        'http://localhost:3845/assets/16e10b05c0ff742cef600c351c6433519cb37f8a.png',
    },
    {
      id: '3',
      title: '무계획 기차여행',
      subtitle: '아산 외암마을 도착',
      imageUrl:
        'http://localhost:3845/assets/16e10b05c0ff742cef600c351c6433519cb37f8a.png',
    },
    {
      id: '4',
      title: '무계획 기차여행',
      subtitle: '아산 외암마을 도착',
      imageUrl:
        'http://localhost:3845/assets/16e10b05c0ff742cef600c351c6433519cb37f8a.png',
    },
  ];

  const handleBackClick = () => {
    router.back();
  };

  const handleDetailClick = (courseId: string) => {
    // 상세보기 페이지로 이동 (추후 구현)
    console.log('상세보기:', courseId);
  };

  const handleSelectClick = (courseId: string) => {
    setSelectedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const handleCompleteClick = () => {
    // 선택 완료 후 다음 단계로 이동
    if (selectedCourses.size === 0) {
      alert('최소 하나의 코스를 선택해주세요.');
      return;
    }
    // TODO: 선택된 코스 데이터를 다음 페이지로 전달
    router.push('/course-plan');
  };

  return (
    <div className={styles.pageWrapper}>
      <PageLayout>
        <Header variant="backArrow"  />

        <div className={styles.content}>
          <div className={styles.textSection}>
            <h1 className={styles.title}>'탈출형'에 맞는 힐링 코스는</h1>
            <div className={styles.description}>
              <p>추천된 코스 중 원하시는 활동을 선택해주시면</p>
              <p>이를 기반으로 코스를 제안해드릴게요.</p>
            </div>
          </div>

          <div className={styles.courseList}>
            {courses.map(course => {
              const isSelected = selectedCourses.has(course.id);
              return (
                <div key={course.id} className={styles.courseCard}>
                  <div className={styles.cardImageContainer}>
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className={styles.cardImage}
                    />
                    <div className={styles.imageOverlay} />
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.cardText}>
                      <h3 className={styles.cardTitle}>{course.title}</h3>
                      <p className={styles.cardSubtitle}>{course.subtitle}</p>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.detailButton}
                        onClick={() => handleDetailClick(course.id)}
                      >
                        상세보기
                      </button>
                      {isSelected ? (
                        <button
                          className={styles.selectedButton}
                          onClick={() => handleSelectClick(course.id)}
                          aria-label="선택 해제"
                        >
                          <IconBox
                            name="circle-check"
                            size={19}
                            color="#ffffff"
                          />
                        </button>
                      ) : (
                        <button
                          className={styles.selectButton}
                          onClick={() => handleSelectClick(course.id)}
                        >
                          선택
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.buttonSection}>
          <button
            className={styles.completeButton}
            onClick={handleCompleteClick}
          >
            선택 완료
          </button>
        </div>
      </PageLayout>
    </div>
  );
};

export default SurveyResultDetailPage;
