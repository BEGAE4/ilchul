import React from 'react';

export type HeaderVariant = 'logo' | 'backArrow' | 'profile';

export type HeaderProps = {
  variant?: HeaderVariant;
  // logo variant props
  logo?: React.ReactNode; // 왼쪽 로고
  profileImage?: string | React.ReactNode; // 오른쪽 프로필 이미지 (logo, profile variant에서 사용)
  onProfileClick?: () => void; // 프로필 클릭 핸들러

  // backArrow variant props
  onBackClick?: () => void; // 뒤로가기 클릭 핸들러
  title?: string; // 선택적 타이틀 (backArrow variant에서 중앙 표시)

  // profile variant props
  username?: string; // 사용자명 (profile variant에서 사용)
  onUsernameClick?: () => void; // 사용자명 클릭 핸들러

  className?: string;
};
