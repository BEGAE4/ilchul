'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/shared/ui/Header';
import IconBox from '@/shared/ui/IconBox';
import { FeedPost } from '../types';
import styles from './FeedDetailPage.module.scss';

interface FeedDetailPageProps {
  post: FeedPost;
}

export const FeedDetailPage: React.FC<FeedDetailPageProps> = ({ post }) => {
  const router = useRouter();
  const currentImage = post.images[post.currentImageIndex || 0];

  const handleBack = () => {
    router.back();
  };

  return (
    <div className={styles.feedDetailPage}>
      {/* 헤더 */}
      <Header
        onLeftClick={handleBack}
        className={styles.header}
      />

      {/* 메인 이미지 */}
      <div className={styles.mainImageContainer}>
        <img 
          src={currentImage} 
          alt={post.description} 
          className={styles.mainImage}
        />
      </div>

      {/* 하단 정보 바 */}
      <div className={styles.bottomBar}>
        {/* 왼쪽: 썸네일과 위치 정보 */}
        <div className={styles.thumbnailSection}>
          <div className={styles.thumbnailWrapper}>
            <img 
              src={currentImage} 
              alt={post.description}
              className={styles.thumbnail}
            />
            <div className={styles.thumbnailOverlay}>
              <div className={styles.locationName}>{post.location}</div>
              <div className={styles.locationDetail}>{post.description}</div>
              <div className={styles.likeIcon}>
                <IconBox name="thumbs-up" size={20} color="#FFFFFF" />
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 액션 아이콘들 */}
        <div className={styles.actionIcons}>
          <button className={styles.iconButton} aria-label="댓글">
            <IconBox name="chat" size={24} color="#000000" />
          </button>
          <button className={styles.iconButton} aria-label="좋아요">
            <IconBox name="heart" size={24} color="#000000" />
          </button>
        </div>
      </div>
    </div>
  );
};

