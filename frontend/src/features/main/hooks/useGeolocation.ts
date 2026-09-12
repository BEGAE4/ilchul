'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * denied: 사용자가 위치 권한을 거부함 — 브라우저가 권한 창을 다시 띄워주지 않는다
 * failed: 시간 초과·신호 없음 등 일시적 실패 — 다시 시도하면 잡히는 경우가 많다
 * unsupported: 브라우저에 위치 기능 자체가 없음 — 다시 시도해도 소용없다
 */
export type GeolocationStatus =
  | 'idle'
  | 'loading'
  | 'granted'
  | 'denied'
  | 'failed'
  | 'unsupported';

export interface GeolocationState {
  status: GeolocationStatus;
  coords: { lat: number; lng: number } | null;
  error: string | null;
  /** 위치를 다시 묻는다. 자동 요청을 이미 했거나 실패한 뒤에도 동작한다. */
  retry: () => void;
}

const TIMEOUT_MS = 7000;
const MAX_AGE_MS = 5 * 60 * 1000;

export function useGeolocation(enabled = true): GeolocationState {
  const [state, setState] = useState<Omit<GeolocationState, 'retry'>>({
    status: 'idle',
    coords: null,
    error: null,
  });
  // 자동 요청은 마운트당 한 번만 한다. 다시 묻는 건 retry 로만.
  const requestedRef = useRef(false);

  const request = useCallback(() => {
    requestedRef.current = true;

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState({ status: 'unsupported', coords: null, error: 'geolocation_unsupported' });
      return;
    }

    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: 'granted',
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
        });
      },
      (err) => {
        // 이전에는 권한 거부가 아닌 실패(시간 초과 등)도 'unsupported' 로 묶어, 다시 시도할 수 있는
        // 실패와 소용없는 실패를 구분하지 못했다.
        setState({
          status: err.code === err.PERMISSION_DENIED ? 'denied' : 'failed',
          coords: null,
          error: err.message,
        });
      },
      // 다시 시도할 때 5분 안에 잡아 둔 값이 있으면 그걸 쓴다
      { timeout: TIMEOUT_MS, maximumAge: MAX_AGE_MS }
    );
  }, []);

  useEffect(() => {
    if (!enabled || requestedRef.current) return;
    request();
  }, [enabled, request]);

  return { ...state, retry: request };
}
