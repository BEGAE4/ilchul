'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Navigation, AlertCircle } from 'lucide-react';
import type { Place, StartingPoint } from '@/shared/types';
import { PLACE_COORDS } from '@/shared/data/mockData';
import { useKakaoMap } from '@/shared/lib/hooks/useKakaoMap';
import { reverseGeocode } from '@/shared/lib/hooks/useKakaoPlaceSearch';

interface RouteMapProps {
  startingPoint: StartingPoint;
  stops: Place[];
  showRoute?: boolean;
  className?: string;
  onMapClick?: (coord: { lat: number; lng: number }, address: string) => void;
}

export function RouteMap({ startingPoint, stops, showRoute = false, className = '', onMapClick }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<(kakao.maps.CustomOverlay | kakao.maps.Marker)[]>([]);
  const polylineRef = useRef<kakao.maps.Polyline | null>(null);
  const loadStatus = useKakaoMap();

  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  // 지도 초기화
  useEffect(() => {
    if (loadStatus !== 'loaded' || !mapRef.current) return;

    const center = new kakao.maps.LatLng(startingPoint.coord.lat, startingPoint.coord.lng);

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new kakao.maps.Map(mapRef.current, {
        center,
        level: 5,
      });
    }
  }, [loadStatus, startingPoint.coord.lat, startingPoint.coord.lng]);

  // 지도 클릭 이벤트
  useEffect(() => {
    if (loadStatus !== 'loaded' || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clickHandler = (mouseEvent: any) => {
      if (!onMapClickRef.current) return;
      const lat = mouseEvent.latLng.getLat();
      const lng = mouseEvent.latLng.getLng();
      reverseGeocode(lat, lng)
        .then((address) => {
          onMapClickRef.current?.({ lat, lng }, address);
        })
        .catch(() => {
          onMapClickRef.current?.({ lat, lng }, `위도 ${lat.toFixed(4)}, 경도 ${lng.toFixed(4)}`);
        });
    };

    kakao.maps.event.addListener(map, 'click', clickHandler);
    return () => {
      kakao.maps.event.removeListener(map, 'click', clickHandler);
    };
  }, [loadStatus]);

  // 마커 & 경로 업데이트
  useEffect(() => {
    if (loadStatus !== 'loaded' || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // 기존 마커/오버레이 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 기존 폴리라인 제거
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const bounds = new kakao.maps.LatLngBounds();
    const startLatLng = new kakao.maps.LatLng(startingPoint.coord.lat, startingPoint.coord.lng);
    bounds.extend(startLatLng);

    // 출발지 오버레이
    const startOverlay = new kakao.maps.CustomOverlay({
      position: startLatLng,
      content: `
        <div style="
          width: 28px; height: 28px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          transform: translate(-50%, -50%);
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
      `,
      map,
      xAnchor: 0,
      yAnchor: 0,
      zIndex: 3,
    });
    markersRef.current.push(startOverlay);

    const pathLatLngs: kakao.maps.LatLng[] = [startLatLng];

    // 장소 마커
    stops.forEach((stop, index) => {
      const coord = PLACE_COORDS[stop.id];
      if (!coord) return;

      const latlng = new kakao.maps.LatLng(coord.lat, coord.lng);
      bounds.extend(latlng);
      pathLatLngs.push(latlng);

      const overlay = new kakao.maps.CustomOverlay({
        position: latlng,
        content: `
          <div style="
            width: 28px; height: 28px;
            background: #f97316;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            font-size: 11px; font-weight: 700; color: white;
            transform: translate(-50%, -50%);
          ">${index + 1}</div>
        `,
        map,
        xAnchor: 0,
        yAnchor: 0,
        zIndex: 3,
      });
      markersRef.current.push(overlay);
    });

    // 경로 폴리라인
    if (showRoute && pathLatLngs.length > 1) {
      polylineRef.current = new kakao.maps.Polyline({
        path: pathLatLngs,
        strokeWeight: 4,
        strokeColor: '#f97316',
        strokeOpacity: 0.9,
        strokeStyle: 'shortdash',
        map,
      });
    }

    // bounds fit
    if (!bounds.isEmpty()) {
      if (stops.length === 0) {
        map.setCenter(startLatLng);
        map.setLevel(5);
      } else {
        map.setBounds(bounds, 48, 48, 48, 48);
      }
    }
  }, [loadStatus, startingPoint, stops, showRoute]);

  // 로딩 / 에러 상태
  if (loadStatus === 'error') {
    return (
      <div
        className={`relative bg-gray-100 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2 ${className}`}
        style={{ minHeight: 200 }}
      >
        <AlertCircle size={24} className="text-red-400" />
        <p className="text-xs text-red-400 text-center px-4">
          지도를 불러오지 못했습니다.<br />API 키 설정을 확인해주세요.
        </p>
      </div>
    );
  }

  if (loadStatus !== 'loaded') {
    return (
      <div
        className={`relative bg-slate-100 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2 ${className}`}
        style={{ minHeight: 200 }}
      >
        <Navigation size={28} className="text-blue-300 animate-pulse" />
        <p className="text-xs text-blue-400">지도 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`} style={{ minHeight: 200 }}>
      {/* 카카오맵 컨테이너 */}
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 200 }} />

      {/* 하단 범례 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm px-3 py-2 pointer-events-none">
        <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>출발</span>
          </div>
          {stops.slice(0, 4).map((stop, i) => (
            <React.Fragment key={stop.id}>
              <span className="text-gray-300">→</span>
              <div className="flex items-center gap-1">
                <div
                  className="w-2.5 h-2.5 rounded-full bg-orange-500 flex items-center justify-center"
                  style={{ fontSize: 7 }}
                >
                  <span className="text-white font-bold" style={{ fontSize: 7 }}>{i + 1}</span>
                </div>
                <span className="truncate max-w-[60px]">{stop.name}</span>
              </div>
            </React.Fragment>
          ))}
          {stops.length > 4 && (
            <span className="text-gray-400">+{stops.length - 4}</span>
          )}
        </div>
      </div>

      {/* 장소 없을 때 안내 */}
      {stops.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-8 pointer-events-none">
          <Navigation size={28} className="text-blue-300 mb-2" />
          <p className="text-xs text-blue-400">출발지를 선택하면 지도가 표시됩니다</p>
        </div>
      )}
    </div>
  );
}
