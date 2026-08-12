// 내 플랜 목록 타입 정의 — PlanSummary (v5 명세 api-docs.json)
export interface MyPlan {
  planId: number;
  planTitle: string;
  createAt: string | null; // ISO date string
  tripStartDate: string | null; // ISO date string (여행 시작)
  tripEndDate: string | null; // ISO date string (여행 종료)
  isPlanVisible: boolean; // 공개 여부
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
}

export interface ScrappedPlansResponse {
  scrappedPlans: ScrappedPlan[];
}


