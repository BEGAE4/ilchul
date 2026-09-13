'use client';

import CoverImage from '@/shared/ui/CoverImage';
import { usePlanCover } from '@/features/plan';

interface PlanCardCoverProps {
  planId: number;
  title: string;
  /** 목록 응답이 준 대표 이미지. 없으면 플랜 상세를 조회해 채운다 */
  src?: string | null;
}

// 마이페이지 목록 카드의 대표 이미지. 목록 응답(planImages)에 이미지가 없는 플랜은
// 상세를 한 번 더 조회해 기록 사진 → 첫 장소 사진 순으로 채운다 (usePlanCover).
export function PlanCardCover({ planId, title, src }: PlanCardCoverProps) {
  const cover = usePlanCover(planId, src);
  return (
    <CoverImage src={cover} alt={title} seed={planId} size="md" sizes="(max-width: 480px) 100vw, 480px" />
  );
}
