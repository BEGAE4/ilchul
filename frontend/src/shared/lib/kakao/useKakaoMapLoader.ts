'use client';

import { useKakaoLoader } from 'react-kakao-maps-sdk';

// 카카오맵 JS SDK 공용 로더.
// 여러 컴포넌트에서 동시에 호출해도 스크립트는 1회만 로드된다.
// services: 주소↔좌표 변환(Geocoder)·키워드 장소 검색(Places)
export function useKakaoMapLoader() {
  return useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY ?? '',
    libraries: ['services', 'clusterer'],
  });
}
