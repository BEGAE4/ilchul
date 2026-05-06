'use client';

import { useSearchParams } from 'next/navigation';
import { redirectToSocialLogin } from '@/features/authentication/api';
import styles from './login.module.scss';

const ERROR_MESSAGES: Record<string, string> = {
  kakao_cancelled: '카카오 로그인이 취소되었습니다. 다시 시도해 주세요.',
  kakao_failed: '카카오 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  google_cancelled: '구글 로그인이 취소되었습니다. 다시 시도해 주세요.',
  google_failed: '구글 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  naver_cancelled: '네이버 로그인이 취소되었습니다. 다시 시도해 주세요.',
  naver_failed: '네이버 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
};

export function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleKakaoLogin = () => redirectToSocialLogin('kakao');
  const handleGoogleLogin = () => redirectToSocialLogin('google');
  const handleNaverLogin = () => redirectToSocialLogin('naver');

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        {error && (
          <div className={styles.errorMessage}>
            {ERROR_MESSAGES[error] ?? '로그인 중 오류가 발생했습니다.'}
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
