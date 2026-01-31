'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Hexagon, MapPin, Search, Smile, UserRound } from 'lucide-react';
import PageLayout from '@/shared/ui/PageLayout';
import Header from '@/shared/ui/Header';
import type { NavItem } from '@/shared/ui/BottomNavigation';
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
  const router = useRouter();

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
        title="피드"
        onLeftClick={() => router.back()}
      />

      <div className={styles.content}>
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
    </PageLayout>
  );
};

