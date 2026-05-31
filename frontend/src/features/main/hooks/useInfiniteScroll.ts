'use client';

import { useCallback, useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  enabled: boolean;
  onIntersect: () => void;
  rootMargin?: string;
}

export type InfiniteScrollSentinelRef = (node: HTMLElement | null) => void;

export function useInfiniteScroll({
  enabled,
  onIntersect,
  rootMargin = '200px',
}: UseInfiniteScrollOptions): InfiniteScrollSentinelRef {
  const callbackRef = useRef(onIntersect);
  callbackRef.current = onIntersect;

  const observerRef = useRef<IntersectionObserver | null>(null);

  const setSentinel = useCallback<InfiniteScrollSentinelRef>(
    (node) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!enabled || !node || typeof IntersectionObserver === 'undefined') {
        return;
      }
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            callbackRef.current();
          }
        },
        { rootMargin }
      );
      observerRef.current.observe(node);
    },
    [enabled, rootMargin]
  );

  useEffect(
    () => () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    },
    []
  );

  return setSentinel;
}
