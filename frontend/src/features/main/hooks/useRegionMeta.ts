'use client';

import { useEffect, useState } from 'react';
import { fetchRegions } from '../api/main.api';
import type { RegionMeta } from '../types';
import { indexRegionMeta } from '../utils/regionMeta';

// 지역 메타(GET /api/region)를 한 번만 받아 모든 화면이 공유한다.
// 실패해도 화면은 프론트의 REGIONS 만으로 동작한다 — 장소 수·시군구 칩만 안 보인다.
let cache: Record<string, RegionMeta> | null = null;
let inflight: Promise<Record<string, RegionMeta>> | null = null;

function load(): Promise<Record<string, RegionMeta>> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetchRegions()
      .then((list) => {
        cache = indexRegionMeta(list);
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export interface RegionMetaState {
  /** 화면 이름·별칭 → 메타. 아직 못 받았으면 빈 객체 */
  byName: Record<string, RegionMeta>;
  isLoading: boolean;
  failed: boolean;
}

export function useRegionMeta(enabled = true): RegionMetaState {
  const [byName, setByName] = useState<Record<string, RegionMeta>>(cache ?? {});
  const [isLoading, setIsLoading] = useState(enabled && !cache);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled || cache) return;
    let alive = true;
    setIsLoading(true);
    load()
      .then((idx) => {
        if (alive) setByName(idx);
      })
      .catch(() => {
        if (alive) setFailed(true);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [enabled]);

  return { byName, isLoading, failed };
}
