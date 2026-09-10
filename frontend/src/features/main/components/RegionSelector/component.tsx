'use client';

import { ChevronDown, LocateFixed, Check } from 'lucide-react';
import { REGIONS } from '../../constants/regions';
import type { RegionState } from '../../hooks/useRegion';

interface RegionSelectorProps {
  state: RegionState;
  /** 시트 열림 상태. 히어로 빈 상태의 CTA 에서도 열 수 있어 밖에서 제어한다. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 홈 최상단의 브랜드 + 지역 영역. 별도 헤더 없이 소제목("당일치기 힐링 플래너 일출")과
 * 로고를 지역명 줄에 함께 두어 한 덩어리로 보이게 한다. 히어로 배너 바로 위에 놓여
 * 히어로 상단 페이드와 이어진다. 지역명을 누르면 시/도 17개 선택 시트가 열린다.
 *
 * 지역명 오른쪽의 "선택 · 변경 · 내 위치" 알약은 두지 않는다 — 지역명 자체가 시트를 여는
 * 버튼이고, 위치 인식 실패는 아래 섹션의 안내 문구가 설명한다.
 */
export function RegionSelector({ state, open, onOpenChange }: RegionSelectorProps) {
  const { region, isLocating, setRegion, resetToCurrentLocation } = state;
  const setOpen = onOpenChange;

  return (
    <>
      <div className="bg-white px-5 pt-6 pb-5">
        <p className="text-xs text-gray-400 mb-2">
          당일치기 힐링 플래너 <span className="font-bold text-gray-900">일출</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={`지역 선택. 현재 ${region.name}`}
          className="flex items-center gap-2.5 min-w-0 active:opacity-70 transition-opacity"
        >
          {/* next/image 는 dangerouslyAllowSVG 없이 로컬 SVG 를 400 으로 거절한다 (인트로·로그인과 동일) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" aria-hidden width={30} height={30} className="shrink-0" />
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
