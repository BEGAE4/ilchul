'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const INTRO_SEEN_KEY = 'ilchul_intro_seen';

export default function LoginSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // 인트로를 거치지 않고 /login 으로 바로 들어와 로그인한 경우, 홈이 인트로로
    // 보내 "로그인 완료 → 인트로 → 로그인 → 홈" 으로 튕긴다. 로그인한 사용자는
    // 인트로를 본 것으로 간주한다 (QA A #6).
    try {
      localStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch {
      /* localStorage 사용 불가 환경은 무시 */
    }

    const timer = setTimeout(() => {
      router.replace('/');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* 카카오·구글·네이버 공통 페이지라 제공자명을 넣지 않는다 (QA A #11) */}
      <p>로그인이 완료되었습니다.</p>
      <button
        type="button"
        onClick={handleGoHome}
        style={{
          padding: '0.75rem 1.5rem',
          borderRadius: '999px',
          border: 'none',
          backgroundColor: '#111827',
          color: '#ffffff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        홈으로 가기
      </button>
    </div>
  );
}
