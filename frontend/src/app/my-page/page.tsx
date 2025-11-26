'use client';

import React from 'react';
import IconBox from '@/shared/ui/IconBox';
import styles from './my-page.module.scss';

interface MenuItemProps {
  label: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, onClick }) => (
  <button className={styles.menuItem} onClick={onClick}>
    <span className={styles.menuLabel}>{label}</span>
    <IconBox name="chevron-right" size={20} color="#9CA3AF" />
  </button>
);

const MyPage: React.FC = () => {
  const handleProfileClick = () => {
    // 프로필 수정 처리
    console.log('Profile clicked');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 프로필 섹션 */}
        <div className={styles.profileSection}>
          <button className={styles.profileButton} onClick={handleProfileClick}>
            <div className={styles.profileInfo}>
              <div className={styles.avatar}>
                <div className={styles.avatarPlaceholder} />
              </div>
              <div className={styles.userInfo}>
                <div className={styles.username}>kong9434</div>
                <div className={styles.email}>kong9434@naver.com</div>
              </div>
            </div>
            <IconBox name="chevron-right" size={20} color="#9CA3AF" />
          </button>
        </div>

        <div className={styles.divider} />

        {/* 메뉴 섹션 */}
        <div className={styles.menuSection}>
          <h2 className={styles.sectionTitle}>나의 메뉴</h2>

          <div className={styles.menuList}>
            <MenuItem
              label="나의 플랜 리스트"
              onClick={() => (window.location.href = '/my-page/course-plan')}
            />
            <MenuItem
              label="좋아요한 장소"
              onClick={() => console.log('좋아요한 장소 클릭')}
            />
            <MenuItem
              label="감정 설문 결과 확인"
              onClick={() => console.log('감정 설문 결과 클릭')}
            />
            <MenuItem
              label="감정 설문 다시 하기"
              onClick={() => console.log('감정 설문 다시 하기 클릭')}
            />
            <MenuItem
              label="계정 관리"
              onClick={() => console.log('계정 관리 클릭')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
