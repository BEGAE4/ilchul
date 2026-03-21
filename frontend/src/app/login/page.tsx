'use client';

import styles from './login.module.scss';

export default function LoginPage() {
  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 로직 구현
    console.log('카카오 로그인');
  };

  const handleGoogleLogin = () => {
    // TODO: 구글 로그인 로직 구현
    console.log('구글 로그인');
  };

  const handleNaverLogin = () => {
    // TODO: 네이버 로그인 로직 구현
    console.log('네이버 로그인');
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>
            <p className={styles.titleLine1}>
              맞춤형 <span className={styles.highlightOrange}>당일치기</span>
            </p>
            <p className={styles.titleLine2}>
              <span className={styles.highlightBlue}>힐링</span> 플래너
            </p>
          </div>
          <div className={styles.logoContainer}>
            <img src="/logo.svg" alt="일출 로고" className={styles.logo} />
          </div>
        </div>

        <div className={styles.loginButtons}>
          <button
            type="button"
            className={`${styles.loginButton} ${styles.kakaoButton}`}
            onClick={handleKakaoLogin}
          >
            <span className={styles.buttonText}>
              <span className={styles.buttonTextBold}>카카오</span> 로그인
            </span>
          </button>

          <button
            type="button"
            className={`${styles.loginButton} ${styles.googleButton}`}
            onClick={handleGoogleLogin}
          >
            <span className={styles.buttonText}>
              <span className={styles.buttonTextBold}>구글</span> 로그인
            </span>
          </button>

          <button
            type="button"
            className={`${styles.loginButton} ${styles.naverButton}`}
            onClick={handleNaverLogin}
          >
            <span className={styles.buttonText}>
              <span className={styles.buttonTextBold}>네이버</span> 로그인
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
