'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import IconBox from '@/shared/ui/IconBox';
import { FeedPost } from '../types';
import styles from './FeedCard.module.scss';

interface FeedCardProps {
  post: FeedPost;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post }) => {
  const router = useRouter();
  const currentImage = post.images[post.currentImageIndex || 0];

  const handleClick = () => {
    router.push(`/feed/${post.id}`);
  };

  return (
    <div className={styles.feedCard} onClick={handleClick} style={{ cursor: 'pointer' }}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {post.avatar ? (
              <img src={post.avatar} alt={post.username} />
            ) : (
              <div className={styles.avatarPlaceholder} />
            )}
          </div>
          <span className={styles.username}>{post.username}</span>
        </div>
        <button className={styles.menuButton}>
          <div className={styles.iconWrapper}>
            <IconBox name="more-vertical" size={24} color="#FFFFFF" />
          </div>
        </button>
      </div>

      {/* 이미지 */}
      <div className={styles.imageContainer}>
        <img src={currentImage} alt={post.description} className={styles.image} />
        <div className={styles.imageOverlay}>
          <div className={styles.location}>{post.location}</div>
          <div className={styles.description}>{post.description}</div>
        </div>
        {/* 캐러셀 인디케이터 */}
        {post.images.length > 1 && (
          <div className={styles.carouselIndicator}>
            {post.images.map((_, index) => (
              <div
                key={index}
                className={`${styles.dot} ${
                  index === (post.currentImageIndex || 0) ? styles.active : ''
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

