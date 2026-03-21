'use client';

import React, { useRef, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import type { Place } from '@/shared/types';
import type { StartingPoint } from '@/shared/types';
import { PLACE_COORDS } from '@/shared/data/mockData';

interface RouteMapProps {
  startingPoint: StartingPoint;
  stops: Place[];
  showRoute?: boolean;
  className?: string;
}

// 좌표를 SVG 뷰포트 좌표로 변환
function coordToSvg(
  coord: { lat: number; lng: number },
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  width: number,
  height: number,
  padding: number = 32
) {
  const latRange = bounds.maxLat - bounds.minLat || 0.01;
  const lngRange = bounds.maxLng - bounds.minLng || 0.01;

  const x =
    padding + ((coord.lng - bounds.minLng) / lngRange) * (width - padding * 2);
  const y =
    padding + (1 - (coord.lat - bounds.minLat) / latRange) * (height - padding * 2);

  return { x, y };
}

export function RouteMap({ startingPoint, stops, showRoute = false, className = '' }: RouteMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const SVG_W = 340;
  const SVG_H = 200;

  // 좌표 수집
  const allCoords: { lat: number; lng: number }[] = [startingPoint.coord];
  stops.forEach((stop) => {
    const coord = PLACE_COORDS[stop.id];
    if (coord) allCoords.push(coord);
  });

  // 바운딩 박스
  const bounds = {
    minLat: Math.min(...allCoords.map((c) => c.lat)),
    maxLat: Math.max(...allCoords.map((c) => c.lat)),
    minLng: Math.min(...allCoords.map((c) => c.lng)),
    maxLng: Math.max(...allCoords.map((c) => c.lng)),
  };

  const startSvg = coordToSvg(startingPoint.coord, bounds, SVG_W, SVG_H);
  const stopSvgPoints = stops
    .map((stop) => {
      const coord = PLACE_COORDS[stop.id];
      if (!coord) return null;
      return { ...coordToSvg(coord, bounds, SVG_W, SVG_H), stop };
    })
    .filter(Boolean) as { x: number; y: number; stop: Place }[];

  const routePoints = [startSvg, ...stopSvgPoints];
  const pathD = routePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div
      className={`relative bg-slate-100 rounded-2xl overflow-hidden ${className}`}
      style={{ minHeight: 200 }}
    >
      {/* 배경 격자 패턴 */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="absolute inset-0"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* 배경 */}
        <rect width={SVG_W} height={SVG_H} fill="#e8f0fe" />

        {/* 격자 */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={(SVG_W / 8) * i}
            y1={0}
            x2={(SVG_W / 8) * i}
            y2={SVG_H}
            stroke="#c5d4f0"
            strokeWidth={0.5}
          />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={(SVG_H / 5) * i}
            x2={SVG_W}
            y2={(SVG_H / 5) * i}
            stroke="#c5d4f0"
            strokeWidth={0.5}
          />
        ))}

        {/* 도로 느낌 선 */}
        <path
          d={`M 0 ${SVG_H * 0.4} Q ${SVG_W * 0.3} ${SVG_H * 0.5} ${SVG_W * 0.6} ${SVG_H * 0.35} T ${SVG_W} ${SVG_H * 0.45}`}
          stroke="#d4e0f5"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M 0 ${SVG_H * 0.7} Q ${SVG_W * 0.4} ${SVG_H * 0.6} ${SVG_W * 0.7} ${SVG_H * 0.7}`}
          stroke="#d4e0f5"
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />

        {/* 경로 선 */}
        {showRoute && stopSvgPoints.length > 0 && (
          <>
            <path
              d={pathD}
              stroke="#f97316"
              strokeWidth={3}
              fill="none"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />
          </>
        )}

        {/* 출발지 마커 */}
        <g transform={`translate(${startSvg.x}, ${startSvg.y})`}>
          <circle r={10} fill="#3b82f6" opacity={0.2} />
          <circle r={6} fill="#3b82f6" />
          <circle r={2} fill="white" />
        </g>

        {/* 정거장 마커들 */}
        {stopSvgPoints.map((pt, i) => (
          <g key={pt.stop.id} transform={`translate(${pt.x}, ${pt.y})`}>
            <circle r={12} fill="white" opacity={0.8} />
            <circle r={9} fill="#f97316" />
            <text
              x={0}
              y={4}
              textAnchor="middle"
              fontSize={9}
              fill="white"
              fontWeight="bold"
            >
              {i + 1}
            </text>
          </g>
        ))}
      </svg>

      {/* 오버레이 레이블 */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>출발</span>
          </div>
          {stops.slice(0, 4).map((stop, i) => (
            <React.Fragment key={stop.id}>
              <span className="text-gray-300">→</span>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-[7px] text-white font-bold">{i + 1}</span>
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

      {/* 빈 상태 */}
      {stops.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-8">
          <Navigation size={28} className="text-blue-300 mb-2" />
          <p className="text-xs text-blue-400">출발지를 선택하면 지도가 표시됩니다</p>
        </div>
      )}
    </div>
  );
}
