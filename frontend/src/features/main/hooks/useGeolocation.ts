'use client';

import { useEffect, useRef, useState } from 'react';

export type GeolocationStatus =
  | 'idle'
  | 'loading'
  | 'granted'
  | 'denied'
  | 'unsupported';

export interface GeolocationState {
  status: GeolocationStatus;
  coords: { lat: number; lng: number } | null;
  error: string | null;
}

const TIMEOUT_MS = 7000;
const MAX_AGE_MS = 5 * 60 * 1000;

export function useGeolocation(enabled = true): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    status: 'idle',
    coords: null,
    error: null,
  });
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!enabled || requestedRef.current) return;

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState({
        status: 'unsupported',
        coords: null,
        error: 'geolocation_unsupported',
      });
      return;
    }

    requestedRef.current = true;
    setState((prev) => ({ ...prev, status: 'loading' }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: 'granted',
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setState({
          status: denied ? 'denied' : 'unsupported',
          coords: null,
          error: err.message,
        });
      },
      { timeout: TIMEOUT_MS, maximumAge: MAX_AGE_MS }
    );
  }, [enabled]);

  return state;
}
