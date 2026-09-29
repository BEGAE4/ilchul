'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { readReasonCollapsed, writeReasonCollapsed } from '../utils/recommendReason';

interface RecommendReasonLineProps {
  // 추천 응답 plan.reasoning — AI 가 이 플랜을 왜 이렇게 골랐는지 한 문단
  reasoning: string;
}

// 추천 결과 헤더 안의 "AI 가 이렇게 골랐어요" 줄 (피그마 시안 C).
// 기본은 전체 문장이 펼쳐져 있고, 누르면 한 줄(말줄임)로 접힌다. 접은 선택은 기억한다.
export function RecommendReasonLine({ reasoning }: RecommendReasonLineProps) {
  const [collapsed, setCollapsed] = useState(false);

  // 첫 렌더는 서버와 같게 펼침으로 두고, 마운트 후 기억해 둔 접힘 상태를 반영한다
  useEffect(() => {
    setCollapsed(readReasonCollapsed());
  }, []);

  if (!reasoning) return null;

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    writeReasonCollapsed(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={!collapsed}
      aria-label={collapsed ? 'AI 추천 이유 펼치기' : 'AI 추천 이유 접기'}
      className="mt-3 w-full flex items-start gap-2 text-left bg-primary-50 rounded-lg px-2.5 py-2 active:bg-primary-100 transition-colors"
    >
      <Sparkles size={14} className="text-primary-500 shrink-0 mt-0.5" aria-hidden />
      <span
        className={`flex-1 min-w-0 text-xs font-medium text-primary-700 leading-[17px] ${
          collapsed ? 'truncate' : 'whitespace-pre-line'
        }`}
      >
        {reasoning}
      </span>
      <ChevronDown
        size={14}
        className={`text-primary-500 shrink-0 mt-0.5 transition-transform ${collapsed ? '' : 'rotate-180'}`}
        aria-hidden
      />
    </button>
  );
}
