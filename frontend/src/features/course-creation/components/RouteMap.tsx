'use client';

import { useEffect, useMemo } from 'react';
import { Map, CustomOverlayMap, Polyline, useMap } from 'react-kakao-maps-sdk';
import { MapPin, Navigation } from 'lucide-react';
import type { Place } from '@/shared/types';
import type { StartingPoint } from '@/shared/types';
import { PLACE_COORDS } from '@/shared/data/mockData';
import { useKakaoMapLoader, type Coord } from '@/shared/lib/kakao';

interface RouteMapProps {
  startingPoint: StartingPoint;
  stops: Place[];
  showRoute?: boolean;
  className?: string;
  // 지도 탭으로 좌표를 선택할 수 있게 한다 (출발지 설정 화면용)
  onSelectCoord?: (coord: Coord) => void;
}

// 장소 좌표: 서버 응답 좌표 우선, 목데이터 장소는 PLACE_COORDS 폴백
export function getStopCoord(stop: Place): Coord | null {
  return stop.coord ?? PLACE_COORDS[stop.id] ?? null;
}

// 마커들이 모두 보이도록 지도 범위를 맞춘다
function FitBounds({ points }: { points: Coord[] }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat},${p.lng}`).join('|');
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setCenter(new kakao.maps.LatLng(points[0].lat, points[0].lng));
      map.setLevel(5);
      return;
    }
    const bounds = new kakao.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
    map.setBounds(bounds, 40, 40, 40, 40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

export function RouteMap({
  startingPoint,
  stops,
  showRoute = false,
  className = '',
  onSelectCoord,
}: RouteMapProps) {
  const [loading, error] = useKakaoMapLoader();

  const stopPoints = useMemo(
    () =>
      stops
        .map((stop) => ({ stop, coord: getStopCoord(stop) }))
        .filter((s): s is { stop: Place; coord: Coord } => s.coord !== null),
    [stops]
  );

  const allPoints = useMemo(
    () => [startingPoint.coord, ...stopPoints.map((s) => s.coord)],
    [startingPoint.coord, stopPoints]
  );

  // SDK 로드 실패 (앱 키 누락/도메인 미등록 등)
  if (error) {
    return (
      <div
        className={`relative bg-slate-100 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-1 ${className}`}
        style={{ minHeight: 200 }}
      >
        <MapPin size={24} className="text-gray-300" />
        <p className="text-xs text-gray-400">지도를 불러오지 못했어요</p>
        <p className="text-[10px] text-gray-300">카카오맵 앱 키와 도메인 등록을 확인해주세요</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`relative bg-slate-100 rounded-2xl overflow-hidden animate-pulse ${className}`}
        style={{ minHeight: 200 }}
      />
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`} style={{ minHeight: 200 }}>
      <Map
        center={startingPoint.coord}
        level={6}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        onClick={
          onSelectCoord
            ? (_map, mouseEvent) =>
                onSelectCoord({
                  lat: mouseEvent.latLng.getLat(),
                  lng: mouseEvent.latLng.getLng(),
                })
            : undefined
        }
      >
        <FitBounds points={allPoints} />

        {/* 출발지 마커 */}
        <CustomOverlayMap position={startingPoint.coord} yAnchor={0.5} zIndex={2}>
          <div className="relative flex items-center justify-center">
            <div className="absolute w-6 h-6 rounded-full bg-primary-500/20" />
            <div className="w-4 h-4 rounded-full bg-primary-500 border-2 border-white shadow" />
          </div>
        </CustomOverlayMap>

        {/* 정거장 순번 마커 */}
        {stopPoints.map((pt, i) => (
          <CustomOverlayMap key={pt.stop.id} position={pt.coord} yAnchor={0.5} zIndex={3}>
            <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white shadow flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">{i + 1}</span>
            </div>
          </CustomOverlayMap>
        ))}

        {/* 경로 선 */}
        {showRoute && stopPoints.length > 0 && (
          <Polyline
            path={allPoints}
            strokeWeight={3}
            strokeColor="#f97316"
            strokeOpacity={0.9}
            strokeStyle="shortdash"
          />
        )}
      </Map>

      {/* 출발지 미선택 힌트 (출발지 설정 화면) */}
      {stops.length === 0 && !startingPoint.address && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm px-3 py-2 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 text-xs text-primary-500">
            <Navigation size={12} />
            <span>
              {onSelectCoord
                ? '지도를 탭하거나 검색해서 출발지를 선택해주세요'
                : '출발지를 선택하면 경로가 표시됩니다'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
