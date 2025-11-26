import React from 'react';
import Header from '@/shared/ui/Header';
import IconBox from '@/shared/ui/IconBox';
import styles from './CourseDetailHeader.module.scss';

interface CourseDetailHeaderProps {
  title: string;
  date: string;
  backgroundImage: string;
  onBack: () => void;
  onShare: () => void;
  onImage: () => void;
}

export const CourseDetailHeader: React.FC<CourseDetailHeaderProps> = ({
  title,
  date,
  backgroundImage,
  onBack,
  onShare,
  onImage
}) => {
  return (
    <div className={styles.headerContainer}>
      <div 
        className={styles.backgroundImage}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className={styles.overlay}>
          <Header
            leftIcon={<IconBox name="arrow-left" size={24} color="white" />}
            rightIcon={
              <div className={styles.rightIcons}>
                <button onClick={onShare} className={styles.iconButton}>
                  <IconBox name="share" size={24} color="white" />
                </button>
                <button onClick={onImage} className={styles.iconButton}>
                  <IconBox name="image" size={24} color="white" />
                </button>
              </div>
            }
            onLeftClick={onBack}
            className={styles.header}
          />
          <div className={styles.content}>
            <div className={styles.date}>{date}</div>
            <div className={styles.title}>{title}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
