import { ImageCard } from '@/shared/ui/ImageCard/component';
import styles from './page.module.scss';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* 히어로 섹션 */}
      <section className={styles.heroSection}>
        <div className={styles.heroImage}>
          <div className={styles.heroOverlay}>
            <div className={styles.heroText}>
              <h1>당신을 위한</h1>
              <h2>피톤치드 가득 힐링 숲</h2>
              <p>조용한 숲속 트래킹으로 내 몸과 마음에 휴식을</p>
            </div>
          </div>
        </div>
      </section>

      {/* 힐링 여행 테마 선택 */}
      <section className={styles.themeSection}>
        <div className={styles.sectionHeader}>
          <h3>일단 출발하는</h3>
          <h4>나만의 힐링 여행 테마</h4>
        </div>
        <div className={styles.themeButtons}>
          <button className={`${styles.themeButton} ${styles.selected}`}>
            아로마 테라피
          </button>
          <button className={styles.themeButton}>산책</button>
          <button className={styles.themeButton}>스파와 온천</button>
        </div>
      </section>

      {/* 아로마 테라피 소개 */}
      <section className={styles.aromaSection}>
        <div className={styles.aromaContent}>
          <div className={styles.aromaText}>
            <h3>고요함 속 좋은 향기와</h3>
            <h4>굳어진 몸의 이완</h4>
          </div>
          <div className={styles.aromaImage}>
            <ImageCard title="" subtitle="" description="" variant="default" />
          </div>
        </div>
      </section>

      {/* 가장 많이 찾는 플랜 */}
      <section className={styles.popularPlansSection}>
        <div className={styles.sectionHeader}>
          <h3>가장 많이 찾는 플랜</h3>
          <button className={styles.moreButton}>더보기</button>
        </div>
        <div className={styles.plansGrid}>
          <ImageCard
            title="시원한 프라이빗 풀에서"
            subtitle="즐기는 나만의 여유"
            variant="default"
            className={styles.planCard}
          />
          <ImageCard
            title="피톤치드오"
            subtitle="당일 치기"
            variant="default"
            className={styles.planCard}
          />
        </div>
      </section>

      {/* 실시간 주변 인기 장소 */}
      <section className={styles.nearbyPlacesSection}>
        <div className={styles.sectionHeader}>
          <h3>실시간 주변 인기 장소</h3>
          <button className={styles.moreButton}>더보기</button>
        </div>
        <div className={styles.placesList}>
          <div className={styles.placeCard}>
            <div className={styles.placeImage}></div>
            <div className={styles.placeInfo}>
              <h4>아로마 테라피</h4>
              <p>둔산점</p>
              <div className={styles.statusBadge}>예약 가능</div>
              <div className={styles.priceInfo}>
                <span>예상 예산</span>
                <span className={styles.price}>75% 54,000원</span>
              </div>
            </div>
          </div>
          <div className={styles.placeCard}>
            <div className={styles.placeImage}></div>
            <div className={styles.placeInfo}>
              <h4>아로마 테라피</h4>
              <p>둔산점</p>
              <div className={styles.statusBadge}>예약 가능</div>
              <div className={styles.priceInfo}>
                <span>예상 예산</span>
                <span className={styles.price}>75% 54,000원</span>
              </div>
            </div>
          </div>
          <div className={styles.placeCard}>
            <div className={styles.placeImage}></div>
            <div className={styles.placeInfo}>
              <h4>아로마 테라피</h4>
              <p>둔산점</p>
              <div className={styles.statusBadge}>예약 가능</div>
              <div className={styles.priceInfo}>
                <span>예상 예산</span>
                <span className={styles.price}>75% 54,000원</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 하단 네비게이션 */}
      <nav className={styles.bottomNavigation}>
        <div className={styles.footerLinks}>
          <span>일출</span>
          <a href="#">이용약관</a>
          <a href="#">사업자 정보</a>
          <a href="#">개인정보처리방침</a>
          <a href="#">입점문의</a>
        </div>
        <div className={styles.navIcons}>
          <div className={styles.navIcon}>🗺️</div>
          <div className={styles.navIcon}>🔍</div>
          <div className={styles.navIcon}>⬡</div>
          <div className={`${styles.navIcon} ${styles.active}`}>😊</div>
          <div className={styles.navIcon}>👤</div>
        </div>
      </nav>
    <div>
      <div>
        <ImageCard title={"title"} subtitle={"subtitle"} description={"description"} />
      </div>
    </div>
    </div>
  );
}
