import React from 'react';
import { Activity } from '../api/course-detail.api';
import styles from './ActivityCard.module.scss';

interface ActivityCardProps {
  activity: Activity;
  order: number;
  onClick: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  order,
  onClick
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#0066cc';
      case 'unavailable':
        return '#ff4444';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return '이용 가능';
      case 'unavailable':
        return '이용 불가';
      default:
        return '';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'train':
        return '무계획 기차여행';
      case 'car':
        return '자가용';
      case 'walk':
        return '도보';
      default:
        return '';
    }
  };

  const getActionButton = () => {
    if (activity.status === 'available') {
      if (activity.type === 'car') {
        return '경로 보기';
      }
      return '방문 가능';
    }
    return null;
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.leftSection}>
        {activity.status === 'unavailable' ? (
          <div className={styles.unavailableIcon}>
            <span>✕</span>
          </div>
        ) : (
          <div className={styles.orderBadge}>
            <span>{order}</span>
          </div>
        )}
        <div className={styles.timeInfo}>
          <div className={styles.time}>
            {activity.startTime} 부터 {activity.endTime} 까지
          </div>
          {activity.status === 'available' && (
            <div className={styles.editLink}>수정</div>
          )}
        </div>
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
              style={{ backgroundColor: getStatusColor(activity.status) }}
            >
              {activity.status === 'available' ? getStatusLabel(activity.status) : getStatusLabel(activity.status)}
            </div>
            
            <div className={styles.cardContent}>
              <h4 className={styles.activityTitle}>{activity.title}</h4>
              <p className={styles.activityDescription}>{activity.description}</p>
              
              {getActionButton() && (
                <button className={styles.actionButton}>
                  {getActionButton()}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
