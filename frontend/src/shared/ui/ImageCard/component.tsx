'use client';

import React from 'react';
import Image from 'next/image';
import { CardProps } from './types';
import styles from './styles.module.scss';

export function ImageCard({
  variant = 'default',
  image,
  title,
  subtitle,
  description,
  action,
  price,
  className = '',
  onClick,
  ...props
}: CardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const renderAction = () => {
    if (!action) return null;

    switch (action.type) {
      case 'button':
        return (
          <button
            className={`${styles.actionButton} ${styles[variant]}`}
            onClick={action.onClick}
          >
            {action.text}
          </button>
        );
      case 'price':
        return (
          <div className={styles.priceInfo}>
            <span className={styles.priceLabel}>{price?.label}</span>
            <span className={styles.priceValue}>
              {price?.discount && (
                <span className={styles.discount}>{price.discount}</span>
              )}
              {price?.value}
            </span>
          </div>
        );
      case 'info':
        return <div className={styles.infoText}>{action.text}</div>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`${styles.card} ${styles[variant]} ${className}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      {...props}
    >
      {/* 배경 이미지 */}
      <div className={styles.imageContainer}>
        {image && (
          <>
            <Image
              src={image}
              alt={title}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className={styles.imageOverlay} />
          </>
        )}
        {/* 콘텐츠 영역 */}
        <div className={styles.content}>
          {/* 제목 영역 */}
          <div className={styles.titleSection}>
            <h3 className={styles.title}>{title}</h3>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          {/* 설명 영역 */}
          {description && <p className={styles.description}>{description}</p>}

          {/* 액션 영역 */}
          <div className={styles.actionSection}>{renderAction()}</div>
        </div>
      </div>
    </div>
  );
}
