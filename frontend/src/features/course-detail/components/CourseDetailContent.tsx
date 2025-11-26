import React from 'react';
import { CourseDetail, Activity } from '../api/course-detail.api';
import { TabMenu } from './TabMenu';
import { ActivityCard } from './ActivityCard';
import styles from './CourseDetailContent.module.scss';

interface CourseDetailContentProps {
  course: CourseDetail;
  activeTab: 'plan' | 'stamp';
  onTabChange: (tab: 'plan' | 'stamp') => void;
  onEditOrder: () => void;
  onActivityClick: (activity: Activity) => void;
  onMoreClick: () => void;
}

export const CourseDetailContent: React.FC<CourseDetailContentProps> = ({
  course,
  activeTab,
  onTabChange,
  onEditOrder,
  onActivityClick,
  onMoreClick
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.title}>{course.title}</div>
          <button className={styles.moreButton} onClick={onMoreClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="6" r="2" fill="currentColor"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
              <circle cx="12" cy="18" r="2" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div className={styles.meta}>
          생성일 {course.date} | {course.isPublic ? '공개' : '비공개'}
        </div>
        <div className={styles.description}>{course.description}</div>
      </div>

      <TabMenu
        tabs={[
          { id: 'plan', label: '계획 상세보기' },
          { id: 'stamp', label: '스탬프 이력 보기' }
        ]}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {activeTab === 'plan' && (
        <div className={styles.planSection}>
          <div className={styles.sectionHeader}>
            <h3>계획 상세보기</h3>
            <button className={styles.editButton} onClick={onEditOrder}>
              순서 수정
            </button>
          </div>

          <div className={styles.activities}>
            {course.activities.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                order={index + 1}
                onClick={() => onActivityClick(activity)}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stamp' && (
        <div className={styles.stampSection}>
          <p>스탬프 이력이 여기에 표시됩니다.</p>
        </div>
      )}
    </div>
  );
};
