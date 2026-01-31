import React, { useState } from 'react';
import Header from '@/shared/ui/Header';
import IconBox from '@/shared/ui/IconBox';
import BottomMenu from '@/shared/ui/BottomMenu';
import { useCourseDetail } from '../hooks/useCourseDetail';
import { useStampHistory } from '../hooks/useStampHistory';
import { CourseDetailPageProps } from '../types/course-detail.types';
import { Stamp } from '../api/course-detail.api';
import { CourseDetailContent } from './CourseDetailContent';
import styles from './CourseDetailPage.module.scss';

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ courseId }) => {
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  
  const {
    course,
    loading,
    error,
    activeTab,
    handleTabChange,
    handleEditOrder,
    handleActivityClick,
    handleBack,
    handleShare,
    handleImage
  } = useCourseDetail(courseId);

  const { stampHistory, stampLoading } = useStampHistory(courseId, activeTab);

  const handleStampClick = (stamp: Stamp) => {
    if (stamp.needsVerification) {
      // TODO: 인증하기 기능 구현
      console.log('인증하기:', stamp);
    } else {
      // TODO: 스탬프 상세 보기
      console.log('스탬프 클릭:', stamp);
    }
  };

  const handleMoreClick = () => {
    setShowBottomMenu(true);
  };

  const bottomMenuItems = [
    {
      id: 'edit',
      label: '수정',
      onClick: () => {
        console.log('수정 클릭');
        setShowBottomMenu(false);
      }
    },
    {
      id: 'share',
      label: '공유',
      onClick: () => {
        handleShare();
        setShowBottomMenu(false);
      }
    },
    {
      id: 'delete',
      label: '삭제',
      onClick: () => {
        console.log('삭제 클릭');
        setShowBottomMenu(false);
      }
    }
  ];

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>코스 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>오류가 발생했습니다: {error}</p>
        <button onClick={handleBack}>돌아가기</button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.notFound}>
        <p>코스를 찾을 수 없습니다.</p>
        <button onClick={handleBack}>돌아가기</button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerSection}>
        {/* Hero Section */}
        <div className={styles.heroContainer}>
          <div 
            className={styles.backgroundImage}
            style={{ backgroundImage: 'url(/images/course-plan.png)' }}
          >
            <div className={styles.overlay} />
          </div>
        </div>
        {/* Header */}
        <div className={styles.headerWrapper}>
          <Header
            leftIcon={<IconBox name="arrow-left" size={24} color="white" />}
            rightIcon={
              <div className={styles.rightIcons}>
                <button onClick={handleShare} className={styles.iconButton}>
                  <IconBox name="share" size={24} color="white" />
                </button>
                <button onClick={handleImage} className={styles.iconButton}>
                  <IconBox name="image" size={24} color="white" />
                </button>
              </div>
            }
            onLeftClick={handleBack}
            className={styles.header}
          />
        </div>
      </div>
      <CourseDetailContent
        course={course}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onEditOrder={handleEditOrder}
        onActivityClick={handleActivityClick}
        onMoreClick={handleMoreClick}
        stampHistory={stampHistory}
        stampLoading={stampLoading}
        onStampClick={handleStampClick}
      />
      
      <BottomMenu
        isOpen={showBottomMenu}
        onClose={() => setShowBottomMenu(false)}
        items={bottomMenuItems}
        title="코스 옵션"
      />
    </div>
  );
};
