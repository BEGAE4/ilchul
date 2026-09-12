'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LocateFixed, Check, RotateCw } from 'lucide-react';
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
 * 지역명 오른쪽의 "선택 · 변경 · 내 위치" 알약은 두지 않는다 — 지역명 자체가 시트를 여는 버튼이다.
 *
 * 소제목과 지역명 사이의 질문은 위치 상태에 맞춘다(Figma H). "현재 당신의 위치는?" 은 GPS 로 잡았을
 * 때만 사실이라, 기본값 서울을 보여줄 때나 직접 고른 지역에 같은 문구를 쓰면 틀린 정보가 된다.
 */
export function RegionSelector({ state, open, onOpenChange }: RegionSelectorProps) {
  const { region, source, isLocating, locateFailure, setRegion, resetToCurrentLocation, retryLocate } =
    state;
  const setOpen = onOpenChange;

  const question = isLocating
    ? '위치를 확인하는 중이에요'
    : source === 'manual'
      ? '어디로 떠나볼까요?'
      : source === 'gps'
        ? '현재 당신의 위치는?'
        : locateFailure === 'denied'
          ? '위치 권한이 꺼져 있어요'
          : '위치를 확인하지 못했어요';
  const questionTone = isLocating
    ? 'text-gray-400'
    : source === 'default'
      ? 'text-accent-500'
      : 'text-gray-700';
  // 위치 기능 자체가 없는 브라우저는 다시 물어도 소용없어 버튼을 두지 않는다
  const canRetry = !isLocating && (locateFailure === 'denied' || locateFailure === 'failed');

  // 권한 거부는 브라우저가 권한 창을 다시 띄워주지 않는다. 설정에서 켜고 돌아온 경우엔 바로 잡히지만,
  // 다시 거부로 끝나면 어디서 켜는지 알려준다. 토스트는 상단에 떠 바로 이 "다시 시도" 버튼을 가려서
  // (하단이면 내비게이션을 가림) 질문 아래 한 줄로 둔다.
  const retriedRef = useRef(false);
  const [deniedAgain, setDeniedAgain] = useState(false);
  const handleRetry = () => {
    retriedRef.current = true;
    retryLocate();
  };
  useEffect(() => {
    if (!retriedRef.current || isLocating) return;
    retriedRef.current = false;
    setDeniedAgain(locateFailure === 'denied');
  }, [isLocating, locateFailure]);

  return (
    <>
      <div className="relative overflow-hidden bg-white px-5 pt-6 pb-5">
        {/*
          오른쪽 여백을 채우는 배경 로고. 알약 버튼을 없앤 뒤 오른쪽이 비어 보여, 로고를 크게 옅게 깔고
          블록 모서리 밖으로 살짝 걸쳐 잘리게 해 장식으로 읽히게 한다. 지역명(시/도 두 글자)과는 겹치지 않는다.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt=""
          aria-hidden
          width={132}
          height={132}
          className="pointer-events-none select-none absolute -right-5 -top-4 opacity-[0.09] rotate-[-8deg]"
        />
        {/* 위계: 브랜드 줄(12) → 질문(15) → 지역명(32) */}
        <div className="relative mb-2.5">
          <p className="text-xs text-gray-400">
            당일치기 힐링 플래너 <span className="font-bold text-gray-900">일출</span>
          </p>
          <div className="mt-1 flex items-center gap-2 min-h-[22px]">
            <p aria-live="polite" className={`text-[15px] font-semibold ${questionTone}`}>
              {question}
            </p>
            {canRetry && (
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1 pl-2 pr-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-bold active:scale-95 transition-transform"
              >
                <RotateCw size={12} strokeWidth={2.5} />
                다시 시도
              </button>
            )}
          </div>
          {deniedAgain && locateFailure === 'denied' && (
            <p className="mt-1 text-[11px] text-gray-400">
              휴대폰 설정에서 이 브라우저의 위치 권한을 켜 주세요
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={`지역 선택. 현재 ${region.name}`}
          className="relative flex items-center gap-2.5 min-w-0 active:opacity-70 transition-opacity"
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
