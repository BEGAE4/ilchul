'use client';

import React from 'react';
import clsx from 'clsx';
import { TextProps } from './types';
import styles from './styles.module.scss';

export default function Text({
  children,
  variant = 'body1',
  size,
  color = 'inherit',
  weight = 'normal',
  align = 'left',
  className = '',
  onClick,
  disabled = false,
  truncate = false,
  lineHeight,
  letterSpacing,
  as,
  ...props
}: TextProps) {
  // variant에 따른 기본 크기 설정
  const defaultSize = size || getDefaultSize(variant);
  
  // variant에 따른 기본 태그 설정 (as prop이 우선)
  const Tag = as || getTagByVariant(variant);

  const textClasses = clsx(
    styles.text,
    styles[`size${defaultSize}`],
    styles[`weight${capitalizeFirst(weight)}`],
    styles[`align${capitalizeFirst(align)}`],
    {
      [styles.clickable]: !!onClick,
      [styles.disabled]: disabled,
      [styles.truncate]: truncate,
    },
    className
  );

  const style = {
    color,
    lineHeight: lineHeight ? `${lineHeight}px` : undefined,
    letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
  };

  // as prop이 있을 때와 없을 때를 구분하여 렌더링
  if (as) {
    // as prop이 지정된 경우 - 타입 안전성을 위해 switch문 사용
    switch (as) {
      case 'div':
        return (
          <div className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </div>
        );
      case 'span':
        return (
          <span className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </span>
        );
      case 'p':
        return (
          <p className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </p>
        );
      case 'h1':
        return (
          <h1 className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </h1>
        );
      case 'h2':
        return (
          <h2 className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </h2>
        );
      case 'h3':
        return (
          <h3 className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </h3>
        );
      case 'h4':
        return (
          <h4 className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </h4>
        );
      case 'h5':
        return (
          <h5 className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </h5>
        );
      case 'h6':
        return (
          <h6 className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </h6>
        );
      case 'a':
        return (
          <a className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </a>
        );
      case 'button':
        return (
          <button className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </button>
        );
      case 'label':
        return (
          <label className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </label>
        );
      case 'strong':
        return (
          <strong className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </strong>
        );
      case 'em':
        return (
          <em className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </em>
        );
      default:
        return (
          <span className={textClasses} style={style} onClick={onClick} {...props}>
            {children}
          </span>
        );
    }
  }

  // variant에 따른 기본 태그 사용
  return (
    <Tag
      className={textClasses}
      style={style}
      onClick={onClick}
      {...props}
    >
      {children}
    </Tag>
  );
}

// variant에 따른 기본 크기 반환
function getDefaultSize(variant: TextProps['variant']): TextProps['size'] {
  switch (variant) {
    case 'h1':
      return 26;
    case 'h2':
      return 24;
    case 'h3':
      return 18;
    case 'body1':
      return 16;
    case 'body2':
      return 14;
    case 'caption':
      return 12;
    case 'button':
      return 14;
    default:
      return 16;
  }
}

// variant에 따른 HTML 태그 반환 (웹 표준 준수)
function getTagByVariant(variant: TextProps['variant']): 'h1' | 'h2' | 'h3' | 'p' {
  switch (variant) {
    case 'h1':
      return 'h1'; // 페이지당 하나만 사용
    case 'h2':
      return 'h2';
    case 'h3':
      return 'h3';
    case 'body1':
    case 'body2':
    case 'caption':
    case 'button':
    default:
      return 'p';
  }
}

// 첫 글자 대문자 변환
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}