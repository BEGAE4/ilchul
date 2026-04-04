'use client';

import { useEffect, useRef, useState } from 'react';
import { useKakaoMap } from './useKakaoMap';

export interface PlaceSearchItem {
  id: string;
  name: string;
  address: string;
  roadAddress: string;
  category: string;
  phone: string;
  coord: { lat: number; lng: number };
}

export function useKakaoPlaceSearch(keyword: string, debounceMs = 300) {
  const loadStatus = useKakaoMap();
  const [results, setResults] = useState<PlaceSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const placesRef = useRef<kakao.maps.services.Places | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loadStatus === 'loaded' && !placesRef.current) {
      placesRef.current = new kakao.maps.services.Places();
    }
  }, [loadStatus]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = keyword.trim();
    if (!trimmed || trimmed.length < 2 || loadStatus !== 'loaded' || !placesRef.current) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    timerRef.current = setTimeout(() => {
      placesRef.current!.keywordSearch(trimmed, (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
          setResults(
            data.map((item) => ({
              id: item.id,
              name: item.place_name,
              address: item.address_name,
              roadAddress: item.road_address_name,
              category: item.category_group_name,
              phone: item.phone,
              coord: { lat: parseFloat(item.y), lng: parseFloat(item.x) },
            })),
          );
        } else {
          setResults([]);
        }
        setSearching(false);
      });
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [keyword, loadStatus, debounceMs]);

  return { results, searching };
}

/**
 * GPS 좌표를 주소로 변환 (역지오코딩)
 */
export function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(lng, lat, (result, status) => {
      if (status === kakao.maps.services.Status.OK && result.length > 0) {
        const addr = result[0].road_address?.address_name || result[0].address.address_name;
        resolve(addr);
      } else {
        reject(new Error('주소를 가져올 수 없습니다'));
      }
    });
  });
}
