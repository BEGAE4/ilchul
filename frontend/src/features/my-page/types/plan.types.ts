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
  // 내가 저장한 시각. v6 명세에는 없어 백엔드에 추가 요청 — 오기 전까지는 서버 순서를 따른다.
  scrappedAt?: string | null;
}

export interface ScrappedPlansResponse {
  scrappedPlans: ScrappedPlan[];
}


