import React, { useState } from 'react';
import { CourseDetailHeader } from './CourseDetailHeader';
import { CourseDetailContent } from './CourseDetailContent';
import BottomMenu from '@/shared/ui/BottomMenu';
import { useCourseDetail } from '../hooks/useCourseDetail';
import styles from './CourseDetailPage.module.scss';

interface CourseDetailPageProps {
  courseId: string;
}

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
      <CourseDetailHeader
        title={course.title}
        date={course.date}
        backgroundImage="/course_plan.png"
        onBack={handleBack}
        onShare={handleShare}
        onImage={handleImage}
      />
      <CourseDetailContent
        course={course}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onEditOrder={handleEditOrder}
        onActivityClick={handleActivityClick}
        onMoreClick={handleMoreClick}
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
