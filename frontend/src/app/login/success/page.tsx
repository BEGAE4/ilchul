'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginSuccessPage() {
  const router = useRouter();

  useEffect(() => {
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <p>카카오 로그인이 완료되었습니다.</p>
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

