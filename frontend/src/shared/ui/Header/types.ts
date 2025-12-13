import React from 'react';

export type HeaderVariant = 'default' | 'withBackground' | 'withTitle';

export type HeaderProps = {
  variant?: HeaderVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightIcons?: React.ReactNode[]; // 여러 개의 오른쪽 아이콘 (배경 있는 헤더용)
  center?: React.ReactNode;
  title?: string; // 타이틀 텍스트 (타이틀 있는 헤더용)
  onLeftClick?: () => void;
  onRightClick?: () => void;
  onRightIconClick?: (index: number) => void; // 오른쪽 아이콘 클릭 핸들러
  className?: string;
};
