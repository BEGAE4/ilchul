'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_REGION, findRegionById, type Region } from '../constants/regions';
import { resolveRegionByCoord } from '../utils/resolveRegion';
import { useGeolocation } from './useGeolocation';

const STORAGE_KEY = 'ilchul_region';

/** manual: 사용자가 직접 고름 / gps: 위치로 자동 인식 / default: 둘 다 없어 기본값(서울) */
export type RegionSource = 'manual' | 'gps' | 'default';

export interface RegionState {
  region: Region;
  source: RegionSource;
  /** 위치 응답을 기다리는 중 — 지역명 자리에 스켈레톤을 보여줄 때 쓴다 */
  isLocating: boolean;
  setRegion: (id: string) => void;
  /** 직접 고른 지역을 지우고 현재 위치로 되돌린다 (위치를 다시 묻는다) */
  resetToCurrentLocation: () => void;
  /**
   * 위치를 못 잡은 이유. 기본 지역(서울)을 보여줄 때만 값이 있다.
   * denied: 권한 거부 / failed: 시간 초과 등 일시적 실패 / unsupported: 위치 기능 없음
   */
  locateFailure: 'denied' | 'failed' | 'unsupported' | null;
  /** 위치를 다시 묻는다 */
  retryLocate: () => void;
}

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * 홈·주변 목록이 함께 쓰는 지역 상태.
 *
 * 우선순위는 사용자가 고른 지역 → 위치로 인식한 지역 → 기본값(서울)이다.
 * 직접 고른 지역이 있으면 위치 권한을 아예 요청하지 않는다.
 */
export function useRegion(enabled = true): RegionState {
  const [manualId, setManualId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setManualId(readStored());
    setHydrated(true);
  }, []);

  const manualRegion = findRegionById(manualId);
  // 직접 고른 지역이 있으면 위치를 묻지 않는다
  const geo = useGeolocation(enabled && hydrated && manualRegion === null);

  const setRegion = useCallback((id: string) => {
    const next = findRegionById(id);
    if (!next) return;
    setManualId(next.id);
    try {
      localStorage.setItem(STORAGE_KEY, next.id);
    } catch {
      /* 저장 불가 환경에서도 이번 세션 동안은 동작한다 */
    }
  }, []);

  const { retry } = geo;
  // 이전에는 직접 고른 지역만 지웠다. 위치 요청은 마운트당 한 번이라, 이미 실패한 뒤에 누르면
  // 위치를 다시 묻지 않고 서울만 다시 보여줬다.
  const resetToCurrentLocation = useCallback(() => {
    setManualId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* 무시 */
    }
    retry();
  }, [retry]);

  if (manualRegion) {
    return {
      region: manualRegion,
      source: 'manual',
      isLocating: false,
      setRegion,
      resetToCurrentLocation,
      locateFailure: null,
      retryLocate: retry,
    };
  }

  const detected = resolveRegionByCoord(geo.coords);
  const isLocating = !hydrated || (enabled && (geo.status === 'idle' || geo.status === 'loading'));

  const locateFailure =
    !detected && !isLocating && (geo.status === 'denied' || geo.status === 'failed' || geo.status === 'unsupported')
      ? geo.status
      : null;

  return {
    region: detected ?? DEFAULT_REGION,
    source: detected ? 'gps' : 'default',
    isLocating,
    setRegion,
    resetToCurrentLocation,
    locateFailure,
    retryLocate: retry,
  };
}
