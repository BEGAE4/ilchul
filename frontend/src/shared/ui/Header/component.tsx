import React from 'react';
import IconBox from '../IconBox';
import { HeaderProps } from './types';
import styles from './styles.module.scss';
import Image from 'next/image';
const Header: React.FC<HeaderProps> = ({
  variant = 'logo',
  logo,
  profileImage,
  onProfileClick,
  onBackClick,
  username,
  onUsernameClick,
  className = '',
}) => {
  // logo variant: 왼쪽 로고, 오른쪽 프로필 이미지
  if (variant === 'logo') {
    return (
      <header className={`${styles.header} ${styles.logo} ${className}`}>
        <div className={styles.logoContainer}>
          {logo || (
            <div className={styles.defaultLogo}>
              <Image src="/logo.svg" alt="logo" width={30} height={30} />
            </div>
          )}
        </div>
        <button
          className={styles.profileButton}
          onClick={onProfileClick}
          aria-label="프로필"
          type="button"
        >
          {typeof profileImage === 'string' ? (
            <Image
              src={profileImage}
              alt="프로필"
              className={styles.profileImage}
              width={32}
              height={32}
            />
          ) : (
            <div className={styles.defaultProfileImage}>
              {/* <IconBox name="user-plus" size={32} /> */}
            </div>
          )}
        </button>
      </header>
    );
  }

  // backArrow variant: 왼쪽 뒤로가기 화살표만
  if (variant === 'backArrow') {
    return (
      <header className={`${styles.header} ${styles.backArrow} ${className}`}>
        <button
          className={styles.backButton}
          onClick={onBackClick}
          aria-label="뒤로가기"
          type="button"
        >
          <IconBox name="arrow-left" size={24} color="rgb(55, 65, 81)" />
        </button>
      </header>
    );
  }

  // profile variant: 왼쪽 뒤로가기 화살표, 프로필 이미지, 사용자명
  if (variant === 'profile') {
    return (
      <header className={`${styles.header} ${styles.profile} ${className}`}>
        <button
          className={styles.backButton}
          onClick={onBackClick}
          aria-label="뒤로가기"
          type="button"
        >
          <IconBox name="arrow-left" size={24} color="rgb(55, 65, 81)" />
        </button>
        <div className={styles.profileSection}>
          <button
            className={styles.profileImageButton}
            onClick={onProfileClick}
            aria-label="프로필"
            type="button"
          >
            {typeof profileImage === 'string' ? (
              <Image
                src={profileImage}
                alt="프로필"
                className={styles.profileImage}
              />
            ) : (
              profileImage || (
                <div className={styles.defaultProfileImage}>
                  {/* <IconBox name="user-plus" size={32} /> */}
                </div>
              )
            )}
          </button>
          {username && (
            <button
              className={styles.usernameButton}
              onClick={onUsernameClick}
              type="button"
            >
              <span className={styles.username}>{username}</span>
            </button>
          )}
        </div>
      </header>
    );
  }

  return null;
};

export default Header;
