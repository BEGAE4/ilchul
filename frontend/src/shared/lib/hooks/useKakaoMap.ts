'use client';

import { useEffect, useState } from 'react';

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

let globalStatus: LoadStatus = 'idle';
const listeners: Set<(status: LoadStatus) => void> = new Set();

function notifyListeners(status: LoadStatus) {
  globalStatus = status;
  listeners.forEach((fn) => fn(status));
}

export function useKakaoMap(): LoadStatus {
  const [status, setStatus] = useState<LoadStatus>(globalStatus);

  useEffect(() => {
    const handler = (s: LoadStatus) => setStatus(s);
    listeners.add(handler);

    if (globalStatus === 'loaded' || globalStatus === 'error') {
      setStatus(globalStatus);
      listeners.delete(handler);
      return;
    }

    if (globalStatus === 'loading') {
      return () => {
        listeners.delete(handler);
      };
    }

    // idle → 로드 시작
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!appKey) {
      console.error('[KakaoMap] NEXT_PUBLIC_KAKAO_MAP_KEY 가 설정되지 않았습니다.');
      notifyListeners('error');
      return;
    }

    notifyListeners('loading');
    setStatus('loading');

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      kakao.maps.load(() => {
        notifyListeners('loaded');
      });
    };

    script.onerror = () => {
      notifyListeners('error');
    };

    document.head.appendChild(script);

    return () => {
      listeners.delete(handler);
    };
  }, []);

  return status;
}
