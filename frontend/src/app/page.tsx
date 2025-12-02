'use client';

import { useEffect, useRef, useState } from 'react';
import { Hexagon, MapPin, Search, Smile, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ImageCard } from '@/shared/ui/ImageCard/component';
import styles from './page.module.scss';

const heroImage =
  'http://localhost:3845/assets/398116975079b078a825ae61887b59837aee71de.png';
const aromaImage =
  'http://localhost:3845/assets/a8bd1ae7ef3479881bfba65e6d6d72b62ae708d1.png';
const poolPlanImage =
  'http://localhost:3845/assets/f0d197b218a5692f6bba05c7f1648b4095ce41ab.png';
const forestPlanImage =
  'http://localhost:3845/assets/3a4ba42bcc1b81eeb272e3e4ce1ea3a87befbe72.png';

const themeOptions = [
  { id: 'aroma', label: '아로마 테라피', selected: true },
  { id: 'walk', label: '산책', selected: false },
  { id: 'spa', label: '스파와 온천', selected: false },
];

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
  { id: 'explore', label: '탐색', icon: Hexagon },
  { id: 'mood', label: '힐링', icon: Smile, active: true },
  { id: 'profile', label: '프로필', icon: UserRound },
];

function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let isPointerDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      isPointerDown = true;
      startX = event.clientX;
      scrollLeft = element.scrollLeft;
      element.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isPointerDown) return;

      const deltaX = event.clientX - startX;
      element.scrollLeft = scrollLeft - deltaX;
      event.preventDefault();
    };

    const endDrag = (event: PointerEvent) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', endDrag);
    element.addEventListener('pointerleave', endDrag);
    element.addEventListener('pointercancel', endDrag);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', endDrag);
      element.removeEventListener('pointerleave', endDrag);
      element.removeEventListener('pointercancel', endDrag);
    };
  }, []);

  return ref;
}

export default function Home() {
  const themeDragRef = useDragScroll<HTMLDivElement>();
  const plansDragRef = useDragScroll<HTMLDivElement>();
  const nearbyDragRef = useDragScroll<HTMLDivElement>();
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
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
            <div
              ref={themeDragRef}
              className={`${styles.themeButtons} ${styles.dragScrollable}`}
              role="list"
            >
              {themeOptions.map(({ id, label, selected }) => (
                <button
                  key={id}
                  className={`${styles.themeButton} ${selected ? styles.themeButtonSelected : ''}`}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              className={styles.aromaCard}
              style={{ backgroundImage: `url(${aromaImage})` }}
            >
              <div className={styles.aromaOverlay} />
              <div className={styles.aromaText}>
                <p>고요함 속 좋은 향기와</p>
                <h3>굳어진 몸의 이완</h3>
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
            <div
              ref={plansDragRef}
              className={`${styles.plansCarousel} ${styles.dragScrollable}`}
            >
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
            <div
              ref={nearbyDragRef}
              className={`${styles.nearbyCards} ${styles.dragScrollable}`}
            >
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
