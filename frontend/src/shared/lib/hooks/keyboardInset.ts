'use client';

import { useEffect, useState } from 'react';

// 주소창이 접히고 펴질 때 생기는 작은 차이는 키보드로 보지 않는다
const MIN_KEYBOARD_HEIGHT = 80;

// 화면 키보드가 가리고 있는 높이(px).
//
// iOS Safari 는 키보드가 올라와도 레이아웃 뷰포트와 dvh 를 줄이지 않고 '보이는 영역'(visualViewport)만 줄인다.
// 그래서 화면 높이에 고정한(fixed + h-dvh) 화면의 맨 아래 요소는 키보드 밑에 깔린다.
// offsetTop 은 Safari 가 입력칸을 보이게 하려고 화면을 위로 밀어 올린 만큼이다.
export function computeKeyboardInset(
  innerHeight: number,
  viewportHeight: number,
  viewportOffsetTop: number
): number {
  const inset = Math.round(innerHeight - viewportHeight - viewportOffsetTop);
  return inset >= MIN_KEYBOARD_HEIGHT ? inset : 0;
}

// 하단에 입력칸을 둔 고정 화면에서 쓴다: 컨테이너 높이를 `calc(100dvh - inset)` 으로 줄이면
// 하단 영역이 키보드 바로 위에 온다. (신고 시트 ReportDialog 와 같은 방식)
export function useKeyboardInset(enabled = true): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = typeof window === 'undefined' ? null : window.visualViewport;
    if (!enabled || !vv) {
      setInset(0);
      return;
    }
    const update = () => setInset(computeKeyboardInset(window.innerHeight, vv.height, vv.offsetTop));
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [enabled]);

  return inset;
}
