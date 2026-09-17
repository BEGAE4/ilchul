'use client';

import { BadgeCheck, Bookmark } from 'lucide-react';
import { PlanCardCover } from './PlanCardCover';
import { formatRequiredTime, formatTripPeriod } from '@/features/my-page/utils/formatPlan';
import type { PublicUserPlan } from '../types/user-profile.types';

interface PublicPlanCardProps {
  plan: PublicUserPlan;
  onClick: () => void;
}

/**
 * 타 유저 프로필의 공개 플랜 카드 (Figma I-1 · 공개 플랜 카드).
 * 마이페이지 내 플랜 카드와 같은 크기지만 공개 스위치 대신 인증 배지·받은 저장 수를 보여준다.
 * planVerified / bookmarkCount 는 백엔드에 추가 요청한 필드라 없으면 배지를 그리지 않는다.
 */
export function PublicPlanCard({ plan, onClick }: PublicPlanCardProps) {
  const showVerified = plan.planVerified === true;
  const showBookmark = typeof plan.bookmarkCount === 'number';
  // 일정이 없으면 '여행일정 일정 미정' 처럼 겹치지 않게 '여행일정 미정' 으로
  const period = formatTripPeriod(plan.tripStartDate, plan.tripEndDate);
  const periodLabel = plan.tripStartDate ? `여행일정 ${period}` : '여행일정 미정';

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:opacity-80"
    >
      <div className="relative h-32">
        <PlanCardCover planId={plan.planId} title={plan.planTitle} src={plan.planImages?.[0]} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {showVerified && (
          <span className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 bg-primary-500 text-white rounded-full shadow">
            <BadgeCheck size={12} />
            <span className="text-[10px] font-bold">인증 플랜</span>
          </span>
        )}
        {showBookmark && (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full shadow">
            <Bookmark size={12} fill="var(--color-primary-500)" className="text-primary-500" />
            <span className="text-[10px] font-bold text-primary-500">저장 {plan.bookmarkCount}</span>
          </span>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-white text-sm line-clamp-1">{plan.planTitle}</h3>
          <p className="text-xs text-white/90 mt-0.5">
            {periodLabel} · 소요 {formatRequiredTime(plan.requiredTime)}
          </p>
        </div>
      </div>
    </div>
  );
}
