'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Hexagon, MapPin, Search, Smile, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ImageCard } from '@/shared/ui/ImageCard/component';
import styles from './page.module.scss';

const INTRO_SEEN_KEY = 'ilchul_intro_seen';

// TODO: 이미지 서버가 준비되면 실제 URL로 변경 필요
// 임시로 placeholder 이미지 사용 (실제 이미지가 준비되면 교체)
const heroImage = '/course_plan.png'; // 임시 이미지
const aromaImage = '/course_plan.png'; // 임시 이미지
const poolPlanImage = '/course_plan.png'; // 임시 이미지
const forestPlanImage = '/course_plan.png'; // 임시 이미지

const themeOptions = [
  { id: 'aroma', label: '아로마 테라피', selected: true },
  { id: 'walk', label: '산책', selected: false },
  { id: 'spa', label: '스파와 온천', selected: false },
];

const themeData = {
  aroma: {
    image: aromaImage,
    text: {
      top: '고요함 속 좋은 향기와',
      bottom: '굳어진 몸의 이완',
    },
  },
  walk: {
    image: forestPlanImage,
    text: {
      top: '자연 속 힐링 산책과',
      bottom: '마음의 평화',
    },
  },
  spa: {
    image: poolPlanImage,
    text: {
      top: '따뜻한 온천과',
      bottom: '몸과 마음의 회복',
    },
  },
};

const popularPlans = [
  {
    id: 'plan-private-pool',
    title: '시원한 프라이빗 풀에서',
    subtitle: '즐기는 나만의 여유',
    image: poolPlanImage,
  },
  {
    id: 'plan-forest-daytrip',
    title: '피톤 치드와 함께하는',
    subtitle: '당일 치기 숲 속 트래킹',
    image: forestPlanImage,
  },
];

const nearbyPlaces = [
  {
    id: 'place-1',
    title: '아로마 테라피',
    location: '둔산점',
    status: '예약 가능',
    discount: '75%',
    price: '54,000원',
    image: poolPlanImage,
  },
  {
    id: 'place-2',
    title: '아로마 테라피',
    location: '둔산점',
    status: '예약 가능',
    discount: '75%',
    price: '54,000원',
    image: forestPlanImage,
  },
  {
    id: 'place-3',
    title: '아로마 테라피',
    location: '둔산점',
    status: '예약 가능',
    discount: '75%',
    price: '54,000원',
    image: poolPlanImage,
  },
];

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

const navItems: NavItem[] = [
  { id: 'map', label: '지도', icon: MapPin },
  { id: 'search', label: '검색', icon: Search },
  { id: 'explore', label: '홈', icon: Hexagon, active: true },
  { id: 'mood', label: '힐링', icon: Smile },
  { id: 'profile', label: '프로필', icon: UserRound },
];

export default function Home() {
  const router = useRouter();
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('aroma');

  useEffect(() => {
    // intro를 보지 않았다면 intro 페이지로 리다이렉트
    const hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY);
    if (hasSeenIntro !== 'true') {
      router.push('/intro');
    }
  }, [router]);

  // 메인 콘텐츠
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* 헤더 없음 - 메인 페이지는 헤더 없이 구성 */}
        <section className={styles.heroSection}>
          <div
            className={styles.heroImage}
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className={styles.heroOverlay} />
            <div className={styles.heroGradient} />
            <div className={styles.heroText}>
              <p>당신을 위한</p>
              <h1>피톤치드 가득 힐링 숲</h1>
              <span>조용한 숲속 트래킹으로 내 몸과 마음에 휴식을</span>
            </div>
          </div>
        </section>

        <div className={styles.content}>
          <section className={styles.themeSection}>
            <div className={styles.sectionTitle}>
              <p>일단 출발하는</p>
              <h2>나만의 힐링 여행 테마</h2>
            </div>
            <div className={styles.themeButtons} role="list">
              {themeOptions.map(({ id, label }) => (
                <button
                  key={id}
                  className={`${styles.themeButton} ${selectedTheme === id ? styles.themeButtonSelected : ''}`}
                  type="button"
                  onClick={() => setSelectedTheme(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              className={styles.aromaCard}
              style={{
                backgroundImage: `url(${themeData[selectedTheme as keyof typeof themeData].image})`,
              }}
            >
              <div className={styles.aromaOverlay} />
              <div className={styles.aromaText}>
                <p>
                  {themeData[selectedTheme as keyof typeof themeData].text.top}
                </p>
                <h3>
                  {
                    themeData[selectedTheme as keyof typeof themeData].text
                      .bottom
                  }
                </h3>
              </div>
            </div>
          </section>

          <section className={styles.popularPlansSection}>
            <div className={styles.sectionHeader}>
              <h3>가장 많이 찾는 플랜</h3>
              <button type="button" className={styles.moreButton}>
                더보기
              </button>
            </div>
            <div className={styles.plansCarousel}>
              {popularPlans.map(plan => (
                <ImageCard
                  key={plan.id}
                  title={plan.title}
                  subtitle={plan.subtitle}
                  image={plan.image}
                  className={styles.planCard}
                />
              ))}
            </div>
          </section>

          <section className={styles.nearbyPlacesSection}>
            <div className={styles.sectionHeader}>
              <h3>실시간 주변 인기 장소</h3>
              <button type="button" className={styles.moreButton}>
                더보기
              </button>
            </div>
            <div className={styles.nearbyCards}>
              {nearbyPlaces.map(place => (
                <article
                  key={place.id}
                  className={styles.nearbyCard}
                  style={{ backgroundImage: `url(${place.image})` }}
                >
                  <div className={styles.nearbyGradient} />
                  <div className={styles.nearbyInfoTop}>
                    <p>{place.title}</p>
                    <span>{place.location}</span>
                  </div>
                  <div className={styles.nearbyInfoBottom}>
                    <span className={styles.statusBadge}>{place.status}</span>
                    <div className={styles.priceInfo}>
                      <span>예상 예산</span>
                      <strong>
                        <em>{place.discount}</em> {place.price}
                      </strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <footer
          className={`${styles.footer} ${isFooterExpanded ? styles.footerExpanded : ''}`}
        >
          <button
            type="button"
            className={styles.footerBrand}
            onClick={() => setIsFooterExpanded(prev => !prev)}
            aria-expanded={isFooterExpanded}
          >
            <span>일출</span>
            <span className={styles.footerToggleIcon}>
              {isFooterExpanded ? '˄' : '˅'}
            </span>
          </button>
          <div className={styles.footerLinks} aria-hidden={!isFooterExpanded}>
            <a href="#">이용약관</a>
            <a href="#">사업자 정보</a>
            <a href="#">개인정보처리방침</a>
            <a href="#">입점문의</a>
          </div>
        </footer>
      </div>

      <nav className={styles.bottomNavigation} aria-label="하단 내비게이션">
        <div className={styles.navIcons}>
          {navItems.map(({ id, label, icon: Icon, active }) => (
            <button
              key={id}
              type="button"
              className={`${styles.navIcon} ${active ? styles.navIconActive : ''}`}
              aria-label={label}
            >
              <Icon aria-hidden="true" size={22} />
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
