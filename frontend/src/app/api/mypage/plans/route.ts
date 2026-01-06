import { NextRequest, NextResponse } from 'next/server';
import { MyPlan } from '@/features/my-page/types/plan.types';

export async function GET(request: NextRequest) {
  try {
    // TODO: 실제 데이터베이스에서 플랜 목록 조회
    // 현재는 예시 데이터 반환
    const plans: MyPlan[] = [
      {
        planId: 1,
        planTitle: '서울 여행 계획',
        createAt: new Date().toISOString(),
        tripDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        planId: 2,
        planTitle: '부산 바다 여행',
        createAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tripDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json(plans);
  } catch (error) {
    console.error('플랜 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '플랜 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

