'use client';

import { useState } from 'react';
import { ChevronDown, LocateFixed, Check } from 'lucide-react';
import { REGIONS } from '../../constants/regions';
import type { RegionState } from '../../hooks/useRegion';

interface RegionSelectorProps {
  state: RegionState;
}

/**
 * 홈 상단의 지역 영역. 히어로 배너 바로 위에 놓여, 히어로 상단 페이드와 이어져
 * 하나의 섹션처럼 보인다. 화살표를 누르면 시/도 17개 선택 시트가 열린다.
 */
export function RegionSelector({ state }: RegionSelectorProps) {
  const { region, source, isLocating, setRegion, resetToCurrentLocation } = state;
  const [open, setOpen] = useState(false);

  const title = isLocating
    ? '위치를 확인하는 중이에요'
    : source === 'default'
      ? '위치를 확인하지 못했어요'
      : '지금 당신의 지역은?';

  return (
    <>
      <div className="bg-white px-5 pt-6 pb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-sm font-medium mb-1.5 ${
              source === 'default' && !isLocating ? 'text-accent-500' : 'text-gray-400'
            }`}
          >
            {title}
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-label={`지역 선택. 현재 ${region.name}`}
            className="flex items-center gap-2 active:opacity-70 transition-opacity"
          >
            {isLocating ? (
              <span className="h-8 w-24 rounded-lg bg-gray-100 animate-pulse" />
            ) : (
              <span className="text-[32px] leading-none font-bold text-gray-900 truncate">
                {region.name}
              </span>
            )}
            <ChevronDown size={22} className="text-primary-500 shrink-0" strokeWidth={2.5} />
          </button>
        </div>

        {source === 'gps' ? (
          <span className="shrink-0 mt-1 px-3 py-2 rounded-full bg-primary-50 text-primary-600 text-xs font-bold">
            내 위치
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 mt-1 px-3 py-2 rounded-full bg-primary-500 text-white text-xs font-bold active:scale-95 transition-transform"
          >
            {source === 'manual' ? '변경' : '선택'}
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-y-0 app-frame z-[120] flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-label="지역 선택"
            className="relative w-full bg-white rounded-t-3xl px-5 pt-3 pb-7 max-h-[80vh] overflow-y-auto"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h3 className="text-[17px] font-bold text-gray-900">지역 선택</h3>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">
              선택한 지역 주변의 장소와 플랜을 보여드려요
            </p>

            <button
              type="button"
              onClick={() => {
                resetToCurrentLocation();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3.5 py-3.5 rounded-xl bg-primary-50 text-primary-600 text-[13px] font-bold active:bg-primary-100 transition-colors"
            >
              <LocateFixed size={16} />
              현재 위치로 자동 설정
            </button>

            <div className="grid grid-cols-3 gap-2.5 mt-4">
              {REGIONS.map((r) => {
                const selected = r.id === region.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setRegion(r.id);
                      setOpen(false);
                    }}
                    aria-pressed={selected}
                    className={`relative py-3 rounded-[10px] text-sm transition-colors ${
                      selected
                        ? 'bg-primary-500 text-white font-bold'
                        : 'bg-gray-50 border border-gray-100 text-gray-700 font-medium active:bg-gray-100'
                    }`}
                  >
                    {r.name}
                    {selected && (
                      <Check size={12} strokeWidth={3} className="absolute top-1.5 right-1.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full py-3 mt-3 text-gray-400 font-bold text-sm"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
