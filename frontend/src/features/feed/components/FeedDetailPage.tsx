'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Hexagon, MapPin, Search, Smile, UserRound } from 'lucide-react';
import PageLayout from '@/shared/ui/PageLayout';
import Header from '@/shared/ui/Header';
import IconBox from '@/shared/ui/IconBox';
import type { NavItem } from '@/shared/ui/BottomNavigation';
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

  const navItems: NavItem[] = [
    { 
      id: 'map', 
      label: '지도', 
      icon: MapPin,
      onClick: () => router.push('/map'),
    },
    { 
      id: 'search', 
      label: '검색', 
      icon: Search,
      onClick: () => router.push('/search'),
    },
    { 
      id: 'explore', 
      label: '홈', 
      icon: Hexagon, 
      active: true,
      onClick: () => router.push('/'),
    },
    { 
      id: 'mood', 
      label: '힐링', 
      icon: Smile,
      onClick: () => router.push('/mood'),
    },
    { 
      id: 'profile', 
      label: '프로필', 
      icon: UserRound,
      onClick: () => router.push('/my-page'),
    },
  ];

  return (
    <PageLayout bottomNavItems={navItems}>
      <Header
        variant="withTitle"
        title="피드 상세"
        onLeftClick={handleBack}
      />

      <div className={styles.content}>
        {/* 메인 이미지 */}
        <div className={styles.mainImageContainer}>
          <img 
            src={currentImage} 
            alt={post.description} 
            className={styles.mainImage}
          />
        </div>

        {/* 하단 정보 바 */}
        <div 
          className={styles.bottomBar}
          onClick={() => router.push(`/place/${post.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              router.push(`/place/${post.id}`);
            }
          }}
        >
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
            <button 
              className={styles.iconButton} 
              aria-label="댓글"
              onClick={(e) => {
                e.stopPropagation();
                console.log('댓글 클릭');
              }}
            >
              <IconBox name="chat" size={24} color="#000000" />
            </button>
            <button 
              className={styles.iconButton} 
              aria-label="좋아요"
              onClick={(e) => {
                e.stopPropagation();
                console.log('좋아요 클릭');
              }}
            >
              <IconBox name="heart" size={24} color="#000000" />
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};


