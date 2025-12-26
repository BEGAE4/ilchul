'use client';

import React from 'react';
import { FeedCard } from './FeedCard';
import { FeedBanner } from './FeedBanner';
import { FeedPost } from '../types';
import styles from './FeedPage.module.scss';

const mockPosts: FeedPost[] = [
  {
    id: '1',
    username: 'username',
    images: [
      '/images/yoga-feed.png', 
    ],
    location: '제주',
    description: '걷다 보니 요가하기 딱 좋은 장소 발견',
    currentImageIndex: 0,
  },
  {
    id: '2',
    username: 'username',
    images: [
      '/images/airplane-feed.png',
    ],
    location: '제주',
    description: '걷다 보니 요가하기 딱 좋은 장소 발견',
    currentImageIndex: 0,
  },
];

export const FeedPage: React.FC = () => {
  return (
    <div className={styles.feedPage}>
      {/* 배너 */}
      <div className={styles.bannerWrapper}>
        <FeedBanner
          image="/images/feed-banner.png"
          title="실시간"
          subtitle="인기 장소"
        />
      </div>

      {/* 피드 리스트 */}
      <div className={styles.feedList}>
        {mockPosts.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

