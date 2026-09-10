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
  /** 직접 고른 지역을 지우고 현재 위치로 되돌린다 */
  resetToCurrentLocation: () => void;
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

  const resetToCurrentLocation = useCallback(() => {
    setManualId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* 무시 */
    }
  }, []);

  if (manualRegion) {
    return { region: manualRegion, source: 'manual', isLocating: false, setRegion, resetToCurrentLocation };
  }

  const detected = resolveRegionByCoord(geo.coords);
  const isLocating = !hydrated || (enabled && (geo.status === 'idle' || geo.status === 'loading'));

  return {
    region: detected ?? DEFAULT_REGION,
    source: detected ? 'gps' : 'default',
    isLocating,
    setRegion,
    resetToCurrentLocation,
  };
}
