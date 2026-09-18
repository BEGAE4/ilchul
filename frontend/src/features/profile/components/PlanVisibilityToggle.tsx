'use client';

import React from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface PlanVisibilityToggleProps {
  /** true=공개, false=비공개, undefined=서버가 공개 여부를 내려주지 않음 */
  isPublic?: boolean;
  isLoading?: boolean;
  onToggle: () => void;
}

/**
 * 플랜 카드 우측 상단의 공개/비공개 스위치.
 *
 * 이전에는 좌측 상단의 작은 라벨 칩이라 상태 뱃지처럼 보여서, 눌러서 바꿀 수 있다는 걸
 * 알기 어려웠다. 트랙 + 노브를 가진 실제 스위치 형태로 바꿔 조작 가능한 요소임을 드러낸다.
 *
 * 카드 배경이 사진이라 대비를 확보하려고 반투명 검정 판 위에 얹는다.
 */
export const PlanVisibilityToggle: React.FC<PlanVisibilityToggleProps> = ({
  isPublic,
  isLoading = false,
  onToggle,
}) => {
  const on = isPublic === true;
  const label = isPublic === undefined ? '미설정' : on ? '공개' : '비공개';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`플랜 공개 여부. 현재 ${label}`}
      disabled={isLoading}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      // 카드 전체가 링크라 스위치 위에서 누른 Space/Enter 가 카드 이동으로 새지 않게 막는다
      onKeyDown={(e) => e.stopPropagation()}
      className={`flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-sm py-1 pl-2.5 pr-1 transition-opacity ${
        isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:opacity-80'
      }`}
    >
      <span className="text-[10px] font-bold text-white leading-none">{label}</span>

      <span
        aria-hidden
        className={`relative block w-[34px] h-[20px] rounded-full transition-colors ${
          on ? 'bg-primary-500' : 'bg-white/35'
        }`}
      >
        <span
          className={`absolute top-[2px] flex items-center justify-center w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
            on ? 'left-[16px]' : 'left-[2px]'
          }`}
        >
          {isLoading ? (
            <Loader2 size={9} strokeWidth={3} className="text-gray-500 animate-spin" />
          ) : on ? (
            <Eye size={9} strokeWidth={3} className="text-primary-600" />
          ) : (
            <EyeOff size={9} strokeWidth={3} className="text-gray-500" />
          )}
        </span>
      </span>
    </button>
  );
};
