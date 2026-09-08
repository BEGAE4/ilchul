'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { redirectToSocialLogin } from '@/features/authentication/api';
import { resolveLoginErrorMessage } from '@/features/authentication/utils/loginErrorMessage';
import { useUserStore } from '@/shared/lib/stores/useUserStore';
import styles from './login.module.scss';

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = resolveLoginErrorMessage(
    searchParams.has('error'),
    searchParams.get('error')
  );
  const authChecked = useUserStore((state) => state.authChecked);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  // 로그인 확인 완료 후 이미 로그인 상태면 홈으로 이동 (로그인 성공 후 재진입 방지)
  useEffect(() => {
    if (authChecked && isLoggedIn) {
      router.replace('/');
    }
  }, [authChecked, isLoggedIn, router]);

  const handleKakaoLogin = () => redirectToSocialLogin('kakao');
  const handleGoogleLogin = () => redirectToSocialLogin('google');
  const handleNaverLogin = () => redirectToSocialLogin('naver');

  // 로그인 확인이 끝나기 전에는 버튼을 감춰, 로그인 사용자가 이 페이지를 지나칠 때
  // 버튼이 잠깐 보였다 사라지는 플래시를 막는다 (QA A #10). 타이틀·로고는 그대로 둔다.
  const showButtons = authChecked && !isLoggedIn;

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        {errorMessage && (
          <div className={styles.errorMessage} role="alert">
            {errorMessage}
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

        <div
          className={styles.loginButtons}
          style={showButtons ? undefined : { visibility: 'hidden' }}
          aria-hidden={!showButtons}
        >
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
