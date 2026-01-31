'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hexagon, MapPin, Search, Smile, UserRound } from 'lucide-react';
import PageLayout from '@/shared/ui/PageLayout';
import Header from '@/shared/ui/Header';
import IconBox from '@/shared/ui/IconBox';
import type { NavItem } from '@/shared/ui/BottomNavigation';
import { PlaceDetailPageProps, PlaceDetail } from '../types';
import { PlaceDetailContent } from './PlaceDetailContent';
import styles from './PlaceDetailPage.module.scss';

// 임시 데이터 - 실제로는 API에서 가져와야 함
const mockPlace: PlaceDetail = {
  id: '1',
  name: '레이지하우스',
  images: [
    '/images/course-plan.png',
    '/images/course-plan.png',
    '/images/course-plan.png',
  ],
  location: {
    address: '경기도 수원시 영통구 청명로59번길 7-3',
    city: '수원시',
    district: '영통구',
    category: '호텔/스테이',
  },
  description: '당일치기 바다 힐링',
  travelTime: '걸어서 🚶‍♀️ 20분',
  operatingHours: {
    monday: '오전 8:30 ~ 오후 10:00',
    tuesday: '오전 8:30 ~ 오후 10:00',
    wednesday: '오전 8:30 ~ 오후 10:00',
    thursday: '오전 8:30 ~ 오후 10:00',
    friday: '오전 8:30 ~ 오후 10:00',
    saturday: '오전 8:30 ~ 오후 10:00',
    sunday: '오전 8:30 ~ 오후 10:00',
  },
  phone: '010-4575-2413',
  hashtags: ['#영동구', '#수원시', '#호텔/스테이'],
  bookmarkCount: 252,
  coordinates: {
    lat: 37.2636,
    lng: 127.0286,
  },
};

export const PlaceDetailPage: React.FC<PlaceDetailPageProps> = ({
  placeId,
}) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'dailylog' | 'info' | 'nearby' | 'curation'>('info');
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 실제로는 API에서 가져와야 함
  const place = mockPlace;

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    console.log('공유하기:', placeId);
  };

  const handleAddToPlan = () => {
    console.log('내 플랜에 추가:', placeId);
  };

  const handleCheckLocation = () => {
    console.log('위치 확인:', placeId);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
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
        title="장소 상세"
        onLeftClick={handleBack}
        rightIcon={
          <IconBox name="share" size={24} color="#000000" />
        }
        onRightClick={handleShare}
      />

      {/* 메인 콘텐츠 */}
      <div className={styles.content}>
        {/* 사진 영역 */}
        <div className={styles.imageSection}>
          <div
            className={styles.backgroundImage}
            style={{ backgroundImage: `url(${place.images[currentImageIndex]})` }}
          >
            <div className={styles.overlay} />
            
            {/* 장소 이름 */}
            <div className={styles.titleSection}>
              <h1 className={styles.placeName}>{place.name}</h1>
            </div>

            {/* 이미지 인디케이터 */}
            {place.images.length > 1 && (
              <div className={styles.imageIndicators}>
                {place.images.map((_, index) => (
                  <div
                    key={index}
                    className={`${styles.indicator} ${
                      index === currentImageIndex ? styles.active : ''
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {/* 여행 시간 정보 */}
        {place.travelTime && (
          <div className={styles.travelTimeInfo}>
            지금 출발 하면? {place.travelTime}
          </div>
        )}

        {/* 지도 섹션 - 탭 메뉴 위에 고정 */}
        <div className={styles.mapSection}>
          <div className={styles.mapPlaceholder}>
            <p>지도 영역</p>
          </div>
          <div className={styles.mapInfo}>
            <div className={styles.locationHeader}>
              <h3 className={styles.locationName}>{place.name}</h3>
              <div className={styles.bookmarkBadge}>
                <IconBox name="heart-fill" size={20} color="#5188f1" />
                <span>{place.bookmarkCount}</span>
              </div>
            </div>
            <p className={styles.locationDetail}>
              {place.location.city}, {place.location.district} | {place.location.category}
            </p>
            <button 
              className={styles.getDirectionsButton} 
              onClick={() => console.log('길찾기')}
            >
              길찾기
              <IconBox name="chevron-right" size={16} color="#5188f1" />
            </button>
          </div>
        </div>

        <PlaceDetailContent
          place={place}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* 하단 액션 바 */}
      <div className={styles.bottomActionBar}>
        <button
          className={styles.addToPlanButton}
          onClick={handleAddToPlan}
        >
          내 플랜에 추가
        </button>
        <button
          className={styles.checkLocationButton}
          onClick={handleCheckLocation}
        >
          위치 확인
        </button>
        <button
          className={styles.bookmarkButton}
          onClick={handleBookmark}
          aria-label="북마크"
        >
          <IconBox
            name={isBookmarked ? 'heart-fill' : 'heart'}
            size={24}
            color={isBookmarked ? '#ef4444' : '#5188f1'}
          />
        </button>
      </div>
    </PageLayout>
  );
};
