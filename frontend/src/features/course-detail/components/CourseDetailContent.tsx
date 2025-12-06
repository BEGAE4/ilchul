import React from 'react';
import { CourseDetailContentProps } from '../types';
import {
  getActivityStatusColor,
  getActivityStatusLabel,
  getActivityTypeLabel,
  getActivityActionButton
} from '../utils/course-detail.utils';
import IconBox from '@/shared/ui/IconBox';
import styles from './CourseDetailPage.module.scss';

export const CourseDetailContent: React.FC<CourseDetailContentProps> = ({
  course,
  activeTab,
  onTabChange,
  onEditOrder,
  onActivityClick,
  onMoreClick,
  stampHistory,
  stampLoading,
  onStampClick
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.contentHeader}>
        <div className={styles.headerTop}>
          <div className={styles.contentTitle}>{course.title}</div>
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

      {/* TabMenu */}
      <div className={styles.tabMenu}>
        {[
          { id: 'plan', label: '계획 상세보기' },
          { id: 'stamp', label: '스탬프 이력 보기' }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id as 'plan' | 'stamp')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'plan' && (
        <div className={styles.planSection}>
          <div className={styles.sectionHeader}>
            <h3>계획 상세보기</h3>
            <button className={styles.editButton} onClick={onEditOrder}>
              순서 수정
            </button>
          </div>

          <div className={styles.activities}>
            {course.activities.map((activity, index) => {
              const order = index + 1;
              
              // ActivityCard - Move 타입
              if (activity.status === 'move') {
                return (
                  <div key={activity.id} className={styles.card} onClick={() => onActivityClick(activity)}>
                    <div className={styles.leftSection}>
                      <div className={styles.moveBadge}>
                        <span>이동</span>
                      </div>
                      <div className={styles.timeInfo}>
                        <div className={styles.time}>
                          {activity.startTime} 부터<br />
                          {activity.endTime}까지
                        </div>
                      </div>
                    </div>
                    <div className={styles.rightSection}>
                      <div className={`${styles.activityCard} ${styles.moveCard}`}>
                        <div className={styles.moveCardContent}>
                          <div className={styles.moveTypeBadge}>
                            {getActivityTypeLabel(activity.type)}
                          </div>
                          <div className={styles.moveCardInfo}>
                            <h4 className={styles.moveTitle}>{activity.title}</h4>
                            {activity.route && (
                              <p className={styles.moveRoute}>{activity.route}</p>
                            )}
                          </div>
                          {getActivityActionButton(activity) && (
                            <button className={styles.moveActionButton}>
                              {getActivityActionButton(activity)}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // ActivityCard - 일반 타입
              return (
                <div key={activity.id} className={styles.card} onClick={() => onActivityClick(activity)}>
                  <div className={styles.leftSection}>
                    {activity.status === 'unavailable' ? (
                      <div className={styles.unavailableIcon}>
                        <span>✕</span>
                      </div>
                    ) : (
                      <>
                        <div className={styles.orderBadge}>
                          <span>{order}</span>
                        </div>
                        <div className={styles.timeInfo}>
                          <div className={styles.time}>
                            {activity.startTime} 부터<br />
                            {activity.endTime} 까지
                          </div>
                          {activity.status === 'available' && (
                            <div className={styles.editLink}>수정</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className={styles.rightSection}>
                    <div 
                      className={styles.activityCard}
                      style={{
                        backgroundImage: activity.imageUrl ? `url(${activity.imageUrl})` : undefined,
                        opacity: activity.status === 'unavailable' ? 0.6 : 1
                      }}
                    >
                      <div className={styles.cardOverlay}>
                        <div 
                          className={styles.statusBadge}
                          style={{ backgroundColor: getActivityStatusColor(activity.status) }}
                        >
                          {getActivityStatusLabel(activity.status)}
                        </div>
                        <div className={styles.cardContent}>
                          <h4 className={styles.activityTitle}>{activity.title}</h4>
                          <p className={styles.activityDescription}>{activity.description}</p>
                        </div>
                        {getActivityActionButton(activity) && (
                          <button className={styles.actionButton}>
                            {getActivityActionButton(activity)}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'stamp' && (
        <div className={styles.stampSection}>
          <h3 className={styles.stampSectionTitle}>스탬프 이력 보기</h3>
          {stampLoading ? (
            <div className={styles.stampLoading}>
              <div className={styles.spinner}></div>
              <p>스탬프 이력을 불러오는 중...</p>
            </div>
          ) : stampHistory.length === 0 ? (
            <div className={styles.stampEmpty}>
              <p>스탬프 이력이 없습니다.</p>
            </div>
          ) : (
            <div className={styles.stampHistoryList}>
              {stampHistory.map((history, index) => (
                <div key={`${history.date}-${index}`} className={styles.stampHistoryGroup}>
                  <div className={styles.stampDate}>{history.date}</div>
                  <div className={styles.stampCardList}>
                    {history.stamps.map((stamp) => (
                      <div key={stamp.id} className={styles.stampCard} onClick={() => onStampClick(stamp)}>
                        <div 
                          className={styles.stampOrderBadge}
                          style={{
                            backgroundColor: stamp.isCompleted ? '#0066cc' : '#666666'
                          }}
                        >
                          <span>{stamp.order}</span>
                        </div>
                        <div className={styles.stampTitle}>{getActivityTypeLabel(stamp.type)}</div>
                        {stamp.isCompleted ? (
                          <div className={styles.stampIcon}>
                            <div className={styles.completedIcon}>
                              <IconBox name="run" size={28} color="white" className={styles.completedIconSvg} />
                            </div>
                          </div>
                        ) : stamp.needsVerification ? (
                          <button className={styles.verifyButton} onClick={(e) => { e.stopPropagation(); onStampClick(stamp); }}>
                            인증하기
                          </button>
                        ) : (
                          <div className={styles.stampIcon}>
                            <div className={styles.pendingIcon}></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

