'use client';

import { useSearchParams } from 'next/navigation';
import styles from './login.module.scss';

const API_BASE_URL = 'http://localhost:8080'; // 환경에 따라 변경
const KAKAO_LOGIN_PATH = '/oauth2/authorization/kakao';
const GOOGLE_LOGIN_PATH = '/oauth2/authorization/google';
const NAVER_LOGIN_PATH = '/oauth2/authorization/naver';

function getSocialLoginUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleKakaoLogin = () => {
    window.location.href = getSocialLoginUrl(KAKAO_LOGIN_PATH);
  };

  const handleGoogleLogin = () => {
    window.location.href = getSocialLoginUrl(GOOGLE_LOGIN_PATH);
  };

  const handleNaverLogin = () => {
    window.location.href = getSocialLoginUrl(NAVER_LOGIN_PATH);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        {error && (
          <div className={styles.errorMessage}>
            {error === 'kakao_cancelled' && '카카오 로그인이 취소되었습니다. 다시 시도해 주세요.'}
            {error === 'kakao_failed' &&
              '카카오 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
            {error === 'google_cancelled' && '구글 로그인이 취소되었습니다. 다시 시도해 주세요.'}
            {error === 'google_failed' &&
              '구글 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
            {error === 'naver_cancelled' && '네이버 로그인이 취소되었습니다. 다시 시도해 주세요.'}
            {error === 'naver_failed' &&
              '네이버 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
            {![
              'kakao_cancelled',
              'kakao_failed',
              'google_cancelled',
              'google_failed',
              'naver_cancelled',
              'naver_failed',
            ].includes(error) && '로그인 중 오류가 발생했습니다.'}
          </div>
        )}
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
