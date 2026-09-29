'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_REGION, findRegionById, type Region } from '../constants/regions';
import { resolveRegionByCoord } from '../utils/resolveRegion';
import { useGeolocation } from './useGeolocation';

const STORAGE_KEY = 'ilchul_region';
// 지역별로 고른 시군구 — { [regionId]: string[] }. 지역을 바꾸면 그 지역에 저장된 선택이 돌아온다.
const SIGUNGU_KEY = 'ilchul_region_sigungu';

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
  /** 현재 지역 안에서 고른 시군구. 비어 있으면 지역 전체 */
  sigungu: string[];
  /** 시군구 선택을 바꾼다 (현재 지역 기준으로 저장) */
  setSigungu: (names: string[]) => void;
}

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

type SigunguMap = Record<string, string[]>;

export function readSigunguMap(): SigunguMap {
  try {
    const raw = localStorage.getItem(SIGUNGU_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: SigunguMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(v)) out[k] = v.filter((x): x is string => typeof x === 'string');
    }
    return out;
  } catch {
    return {};
  }
}

function writeSigunguMap(map: SigunguMap): void {
  try {
    localStorage.setItem(SIGUNGU_KEY, JSON.stringify(map));
  } catch {
    /* 저장 불가 환경에서도 이번 세션 동안은 동작한다 */
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
  const [sigunguMap, setSigunguMap] = useState<SigunguMap>({});

  useEffect(() => {
    setManualId(readStored());
    setSigunguMap(readSigunguMap());
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

  const detected = resolveRegionByCoord(geo.coords);
  const currentRegion = manualRegion ?? detected ?? DEFAULT_REGION;
  const sigungu = sigunguMap[currentRegion.id] ?? [];
  const currentRegionId = currentRegion.id;
  const setSigungu = useCallback(
    (names: string[]) => {
      setSigunguMap((prev) => {
        const next = { ...prev };
        const cleaned = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
        if (cleaned.length === 0) delete next[currentRegionId];
        else next[currentRegionId] = cleaned;
        writeSigunguMap(next);
        return next;
      });
    },
    [currentRegionId]
  );

  if (manualRegion) {
    return {
      region: manualRegion,
      source: 'manual',
      isLocating: false,
      setRegion,
      resetToCurrentLocation,
      locateFailure: null,
      retryLocate: retry,
      sigungu,
      setSigungu,
    };
  }

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
    sigungu,
    setSigungu,
  };
}
