// 내 플랜 목록 타입 정의
export interface MyPlan {
  planId: number;
  planTitle: string;
  createAt: string | null; // ISO date string (아직 미구현으로 null 허용)
  tripDate: string; // ISO date string
  placeCount: number;
  planImages: string[];
  // 백엔드가 수정 예정인 필드
  isPublic?: boolean;
}

export interface MyPlansResponse {
  plans: MyPlan[];
}


