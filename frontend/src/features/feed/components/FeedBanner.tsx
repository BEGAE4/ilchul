'use client';

import React from 'react';
import { FeedBannerProps } from '../types';
import styles from './FeedBanner.module.scss';

export const FeedBanner: React.FC<FeedBannerProps> = ({ image, title, subtitle }) => {
  return (
    <div className={styles.banner}>
      <img src={image} alt={title} className={styles.bannerImage} />
      <div className={styles.bannerGradient} />
      <div className={styles.bannerOverlay}>
        <div className={styles.bannerTitle}>{title}</div>
        <div className={styles.bannerSubtitle}>{subtitle}</div>
      </div>
    </div>
  );
};

