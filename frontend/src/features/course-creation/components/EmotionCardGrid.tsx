'use client';

import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { DIRECT_INPUT_CHARACTER, MIND_STATES, characterSrc } from '../utils/mindStates';

interface EmotionCardGridProps {
  /** 지금 고른 마음 상태(서버로 보내는 문장). 직접 입력 중이면 적은 문장 */
  value: string;
  isDirectInput: boolean;
  onSelect: (label: string) => void;
  onDirectInput: () => void;
}

// 감정 설문(Q1)의 2×4 카드. 왼쪽 위에 짧은 낱말, 오른쪽 아래에 표정 캐릭터.
//
// 이전에는 긴 문장 알약 버튼 7개 + '직접 입력하기'가 세로로 쌓여 작은 화면에서 스크롤이 생겼고,
// 문장을 다 읽어야 고를 수 있었다. 카드는 낱말과 표정으로 먼저 고르게 하고, 원래 문장은 고른 뒤
// 하단에서 보여준다. 서버로 보내는 값은 여전히 원래 문장이다.
export const EmotionCardGrid: React.FC<EmotionCardGridProps> = ({
  value,
  isDirectInput,
  onSelect,
  onDirectInput,
}) => {
  const cards = [
    ...MIND_STATES.map((s) => ({
      key: s.label,
      text: s.short,
      ariaLabel: s.label,
      character: s.character,
      selected: !isDirectInput && value === s.label,
      muted: false,
      onClick: () => onSelect(s.label),
    })),
    {
      key: 'direct',
      text: '직접 쓸게요',
      ariaLabel: '지금 느끼는 감정을 직접 적기',
      character: DIRECT_INPUT_CHARACTER,
      selected: isDirectInput,
      // 감정이 아니라 '행동'이라 라벨을 한 단계 낮춘다
      muted: true,
      onClick: onDirectInput,
    },
  ];

  return (
    <div role="radiogroup" aria-label="요즘 마음 상태" className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <button
          key={card.key}
          type="button"
          role="radio"
          aria-checked={card.selected}
          aria-label={card.ariaLabel}
          onClick={card.onClick}
          className={`relative h-[104px] rounded-2xl text-left transition-all active:scale-[0.98] ${
            card.selected
              ? 'border-2 border-primary-500 bg-primary-50'
              : 'border-[1.5px] border-gray-100 bg-white shadow-[0_2px_10px_rgba(17,24,39,0.05)]'
          }`}
        >
          <span
            className={`absolute left-4 top-[15px] text-base font-bold ${
              card.selected ? 'text-primary-700' : card.muted ? 'text-gray-500' : 'text-gray-900'
            }`}
          >
            {card.text}
          </span>
          {card.selected && (
            <span className="absolute left-4 top-[42px] w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
              <Check size={12} strokeWidth={3.2} className="text-white" />
            </span>
          )}
          <Image
            src={characterSrc(card.character)}
            alt=""
            aria-hidden
            width={56}
            height={56}
            unoptimized
            className="absolute right-3 bottom-2.5 select-none pointer-events-none"
          />
        </button>
      ))}
    </div>
  );
};
