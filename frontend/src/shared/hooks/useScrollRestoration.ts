'use client';

import { useEffect, useRef } from 'react';

const PREFIX = 'ilchul:scroll:';

// PageLayout 의 스크롤 컨테이너([data-scroll-container])의 스크롤 위치를 세션에 저장하고,
// 목록 → 상세 → 뒤로가기 시 원래 위치로 복원한다.
// - key: 화면·필터별로 고유한 문자열(예: 'search:서울:장소'). null 이면 아무것도 하지 않는다.
// - ready: 목록 콘텐츠가 렌더되어 복원 가능한 높이가 확보된 시점(true 일 때 복원 시도).
export function useScrollRestoration(key: string | null, ready: boolean): void {
  // 스크롤 위치 저장
  useEffect(() => {
    if (!key || typeof window === 'undefined') return;
    const el = document.querySelector<HTMLElement>('[data-scroll-container]');
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        try {
          sessionStorage.setItem(PREFIX + key, String(el.scrollTop));
        } catch {
          /* 무시 */
        }
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [key]);

  // 스크롤 위치 복원 (콘텐츠가 준비된 뒤 1회)
  const restoredRef = useRef(false);
  useEffect(() => {
    restoredRef.current = false;
  }, [key]);

  useEffect(() => {
    if (!key || !ready || restoredRef.current || typeof window === 'undefined') return;

    let saved = 0;
    try {
      saved = Number(sessionStorage.getItem(PREFIX + key) || 0);
    } catch {
      /* 무시 */
    }
    if (!saved) {
      restoredRef.current = true;
      return;
    }

    const el = document.querySelector<HTMLElement>('[data-scroll-container]');
    if (!el) return;

    // 이미지 로딩 등으로 높이가 나중에 커질 수 있어, 목표 위치에 도달할 때까지 몇 프레임 재시도한다.
    let attempts = 0;
    let raf = 0;
    const apply = () => {
      el.scrollTop = saved;
      attempts += 1;
      if (Math.abs(el.scrollTop - saved) > 2 && attempts < 40) {
        raf = requestAnimationFrame(apply);
      } else {
        restoredRef.current = true;
      }
    };
    raf = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(raf);
  }, [key, ready]);
}
