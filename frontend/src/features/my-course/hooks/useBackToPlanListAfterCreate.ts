'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CREATED_PLAN_BACK_TARGET,
  clearCreatedPlanBack,
  markBackGuardPushed,
  readCreatedPlanBack,
} from '@/shared/lib/navigation/createdPlanBack';

/**
 * 방금 만든 플랜의 상세 화면에서 뒤로가기를 마이페이지 플랜 목록으로 보낸다.
 *
 * 화면의 뒤로가기 버튼(router.back)과 브라우저·스와이프 뒤로가기가 모두 같은 기록을 따라가므로,
 * 버튼만 바꾸지 않고 기록 자체를 다룬다. 같은 주소의 기록을 하나 더 쌓아 두면 뒤로가기는
 * 화면 변화 없이 그 기록만 걷어내고 popstate 가 온다 — 그때 남은 상세 기록을 플랜 목록으로 바꾼다.
 * 다른 경로로 들어온 상세 화면에는 아무 영향이 없다.
 */
export function useBackToPlanListAfterCreate(planId: string): void {
  const router = useRouter();

  useEffect(() => {
    const marker = readCreatedPlanBack(planId);
    if (!marker) return;

    if (!marker.guardPushed) {
      window.history.pushState(null, '', window.location.href);
      markBackGuardPushed(planId);
    }

    const onPopState = () => {
      clearCreatedPlanBack();
      router.replace(CREATED_PLAN_BACK_TARGET);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [planId, router]);
}
