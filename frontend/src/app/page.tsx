'use client';

import { useState } from 'react';
import { ImageCard } from '@/shared/ui/ImageCard/component';
import styles from './page.module.scss';

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState('아로마 테라피');

  const healingThemes = [
    {
      id: 'aroma',
      label: '아로마 테라피',
      isActive: selectedTheme === '아로마 테라피',
    },
    { id: 'walk', label: '산책', isActive: selectedTheme === '산책' },
    {
      id: 'spa',
      label: '스파와 온천',
      isActive: selectedTheme === '스파와 온천',
    },
  ];

  const popularPlans = [
    {
      id: 1,
      title: '시원한 프라이빗 풀에서 즐기는 나만의 여유',
      image: '/images/private-pool.jpg',
      type: 'experience',
    },
    {
      id: 2,
      title: '피톤치드오 당일 치기',
      image: '/images/forest.jpg',
      type: 'experience',
    },
  ];

  const nearbyPlaces = [
    {
      id: 1,
      title: '아로마 테라피 둔산점',
      image: '/images/aroma-dunsan.jpg',
      action: { type: 'button' as const, text: '예약 가능', onClick: () => {} },
      price: { label: '예상 예산', value: '54,000원', discount: '75%' },
    },
    {
      id: 2,
      title: '아로마 테라피 둔산점',
      image: '/images/aroma-dunsan2.jpg',
      action: { type: 'button' as const, text: '예약 가능', onClick: () => {} },
      price: { label: '예상 예산', value: '54,000원', discount: '75%' },
    },
    {
      id: 3,
      title: '아로마 테라피 둔산점',
      image: '/images/aroma-dunsan3.jpg',
      action: { type: 'button' as const, text: '예약 가능', onClick: () => {} },
      price: { label: '예상 예산', value: '54,000원', discount: '75%' },
    },
  ];

  return (
    <div className={styles.homePage}>
      {/* 힐링 숲 히어로 섹션 */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}>
          <ImageCard
            title="당신을 위한"
            subtitle="피톤치드 가득 힐링 숲"
            description="조용한 숲속 트래킹으로 내 몸과 마음에 휴식을"
            image="/images/mock/forest-heel.png"
            variant="service"
            className={styles.heroCard}
          />
        </div>
      </section>

      {/* 힐링 여행 테마 섹션 */}
      <section className={styles.themesSection}>
        <div className={styles.sectionHeader}>
          <h2>일단 출발하는 나만의 힐링 여행 테마</h2>
        </div>

        <div className={styles.themeButtons}>
          {healingThemes.map(theme => (
            <button
              key={theme.id}
              className={`${styles.themeButton} ${theme.isActive ? styles.active : ''}`}
              onClick={() => setSelectedTheme(theme.label)}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </section>

      {/* 아로마 테라피 카드 섹션 */}
      <section className={styles.aromaSection}>
        <ImageCard
          title="고요함 속 좋은 향기와 굳어진 몸의 이완"
          image="/images/aroma-therapy.jpg"
          variant="service"
          className={styles.aromaCard}
        />
      </section>

      {/* 가장 많이 찾는 플랜 섹션 */}
      <section className={styles.popularPlansSection}>
        <div className={styles.sectionHeader}>
          <h2>가장 많이 찾는 플랜</h2>
          <a href="/courses" className={styles.moreLink}>
            더보기
          </a>
        </div>

        <div className={styles.plansGrid}>
          {popularPlans.map(plan => (
            <ImageCard
              key={plan.id}
              title={plan.title}
              image={plan.image}
              variant="experience"
              className={styles.planCard}
            />
          ))}
        </div>
      </section>

      {/* 실시간 주변 인기 장소 섹션 */}
      <section className={styles.nearbyPlacesSection}>
        <div className={styles.sectionHeader}>
          <h2>실시간 주변 인기 장소</h2>
          <a href="/courses" className={styles.moreLink}>
            더보기
          </a>
        </div>

        <div className={styles.placesGrid}>
          {nearbyPlaces.map(place => (
            <ImageCard
              key={place.id}
              title={place.title}
              image={place.image}
              action={place.action}
              price={place.price}
              variant="service"
              className={styles.placeCard}
            />
          ))}
        </div>
      </section>

      {/* 하단 네비게이션 */}
      <nav className={styles.bottomNavigation}>
        <div className={styles.navItem}>
          <span className={styles.navIcon}>🗺️</span>
          <span className={styles.navLabel}>지도</span>
        </div>
        <div className={styles.navItem}>
          <span className={styles.navIcon}>🔍</span>
          <span className={styles.navLabel}>검색</span>
        </div>
        <div className={styles.navItem}>
          <span className={styles.navIcon}>💎</span>
          <span className={styles.navLabel}>추천</span>
        </div>
        <div className={`${styles.navItem} ${styles.active}`}>
          <span className={styles.navIcon}>😊</span>
          <span className={styles.navLabel}>힐링</span>
        </div>
        <div className={styles.navItem}>
          <span className={styles.navIcon}>👤</span>
          <span className={styles.navLabel}>마이</span>
        </div>
      </nav>
    </div>
  );
}
