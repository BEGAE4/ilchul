// 내 플랜 목록 타입 정의 (GET /api/mypage/plans → PlanSummary, 명세 260822)
// 이전 정의(tripDate/placeCount/isPublic)는 구버전 응답이라 카드에 "생성일 미정 · 장소 개"가 찍히고
// 공개 토글 초기값이 항상 '미설정'이었다.
export interface MyPlan {
  planId: number;
  planTitle: string;
  createAt: string | null; // 'yyyy-MM-dd HH:mm' 또는 ISO
  tripStartDate: string | null;
  tripEndDate: string | null;
  isPlanVisible: boolean;
  requiredTime: number; // 소요 시간 (분)
  planImages: string[];
}

export interface MyPlansResponse {
  plans: MyPlan[];
}

// 저장(스크랩)한 플랜 목록 타입 정의
export interface ScrappedPlan {
  planId: number;
  planTitle: string;
  createAt: string | null; // ISO date string
  tripStartDate: string | null; // ISO date string (여행 시작)
  tripEndDate: string | null; // ISO date string (여행 종료)
  isPlanVisible: boolean; // 원본 플랜 공개 여부
  requiredTime: number; // 소요 시간 (분)
  planImages: string[];
  // 내가 저장한 시각. 2026-09-18 백엔드 추가 (2차 요청 7-5) — 저장 플랜 탭은 이 값으로 최신순 정렬한다.
  // 단, 저장을 풀었다 다시 저장해도 값이 갱신되지 않는 것을 운영에서 확인했다(백엔드에 전달).
  scrappedAt: string | null;
}

export interface ScrappedPlansResponse {
  scrappedPlans: ScrappedPlan[];
}


