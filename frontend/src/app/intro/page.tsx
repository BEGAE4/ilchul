'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './intro.module.scss';

const logoImage = '/logo.svg';
const INTRO_SEEN_KEY = 'ilchul_intro_seen';

export default function IntroPage() {
  const router = useRouter();
  const [currentScene, setCurrentScene] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 이미 intro를 본 경우 로그인 페이지로 바로 이동
    // const hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY);
    // if (hasSeenIntro === 'true') {
    //   router.push('/login');
    //   return;
    // }

    // 첫 번째 장면 표시
    setIsVisible(true);

    // 첫 번째 장면 (로고) - 1.2초
    const timer1 = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentScene(1);
        setIsVisible(true);
      }, 200); // 페이드 아웃 시간
    }, 1200);

    // 두 번째 장면 (텍스트) - 1.5초
    const timer2 = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentScene(2);
        setIsVisible(true);
      }, 200);
    }, 2900); // 1200 + 200 + 1500

    // 세 번째 장면 (일출) - 1.6초 후 로그인 페이지로 이동 (총 5초)
    const timer3 = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        // intro를 본 것으로 표시
        localStorage.setItem(INTRO_SEEN_KEY, 'true');
        router.push('/login');
      }, 200);
    }, 5000); // 2900 + 200 + 1600 + 200 = 5000

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [router]);

  return (
    <div className={styles.introContainer}>
      {/* 첫 번째 장면: 로고 */}
      <div
        className={`${styles.scene} ${currentScene === 0 && isVisible ? styles.visible : ''}`}
      >
        <div className={styles.logoContainer}>
          <img src={logoImage} alt="일출 로고" className={styles.logo} />
        </div>
      </div>

      {/* 두 번째 장면: 텍스트 */}
      <div
        className={`${styles.scene} ${currentScene === 1 && isVisible ? styles.visible : ''}`}
      >
        <div className={styles.textContainer}>
          <p className={styles.textLine1}>쉬고 싶은 그대</p>
          <p className={styles.textLine2}>
            <span className={styles.highlightOrange}>일</span>
            <span>단</span> <span className={styles.highlightBlue}>출</span>
            <span>발하라!</span>
          </p>
        </div>
      </div>

      {/* 세 번째 장면: 일출 텍스트 */}
      <div
        className={`${styles.scene} ${currentScene === 2 && isVisible ? styles.visible : ''}`}
      >
        <div className={styles.titleContainer}>
          <p className={styles.title}>일출</p>
        </div>
      </div>
    </div>
  );
}
