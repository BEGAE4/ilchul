'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FeedDetailPage } from '@/features/feed/components/FeedDetailPage';
import { FeedPost } from '@/features/feed/types';

// 임시 데이터 - 실제로는 API에서 가져와야 함
const mockPosts: Record<string, FeedPost> = {
  '1': {
    id: '1',
    username: 'username',
    images: [
      '/images/yoga-feed.png', 
    ],
    location: '어느 공원',
    description: '청주',
    currentImageIndex: 0,
  },
  '2': {
    id: '2',
    username: 'username',
    images: [
      '/images/airplane-feed.png',
    ],
    location: '어느 공원',
    description: '청주',
    currentImageIndex: 0,
  },
};

export default function FeedDetail() {
  const params = useParams();
  const postId = params.id as string;
  const post = mockPosts[postId];

  if (!post) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        color: '#ffffff'
      }}>
        피드를 찾을 수 없습니다.
      </div>
    );
  }

  return <FeedDetailPage post={post} />;
}


