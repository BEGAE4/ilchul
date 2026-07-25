// PLAN API (v6) 타입 정의 — cc/api/v6/260723-v6-004-plan.md, 005-plan-place.md, 002-mypage.md 기준

export interface DeparturePoint {
  name: string;
  address: string;
  x: number;
  y: number;
}

// 플랜 상세의 장소 항목 (PlanPlaceDetailDto)
export interface PlanPlaceDetail {
  planPlaceId: number;
  placeId: number;
  placeImage: string;
  placeName: string;
  categoryName: string;
  address: string;
  roadAddress: string;
  orderIndex: number;
  visitTime: string;
  stayDescription: string;
  isStamped: boolean;
  travelTime: number;
  stayTime: number;
}

// 플랜 상세 조회 응답 (PlanDetailDto) — 래핑 없이 직접 반환
export interface PlanDetail {
  planId: number;
  planTitle: string;
  tripStartDate: string;
  tripEndDate: string;
  createAt: string;
  planVerified: boolean;
  isPlanVisible: boolean;
  isBookmarked: boolean;
  isLiked: boolean;
  requiredTime: number;
  totalDistance: number;
  planDescription: string;
  likeCount: number;
  bookmarkCount: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  planImageUrls: string[];
  tags: string[];
  thumbnailUrl: string;
  planPlaceDetailDtos: PlanPlaceDetail[];
}

// 플랜 생성 (POST /api/plan/create) — 출발지/일정/장소까지 일괄 등록
export interface CreatePlanPlaceRequest {
  placeId: number;
  order: number;
  // 명세 필수 — 생성 프리뷰(CreatePlanPreviewResponseDto)의 duration/stayTime에서 채운다
  travelTime: number;
  stayTime: number;
}

export interface CreatePlanBody {
  planTitle: string;
  isPlanVisible?: boolean;
  planDescription?: string;
  // 명세 필수 — 생성 프리뷰 응답에서 채운다
  requiredTime: number;
  totalDistance: number;
  departurePoint?: DeparturePoint;
  tripStartDate?: string;
  tripEndDate?: string;
  places?: CreatePlanPlaceRequest[];
}

export interface CreatePlanResponse {
  planId: number;
  planTitle: string;
  createAt: string;
  planVisible: boolean;
}

// 플랜 수정 (PATCH /api/plan/{planId})
export interface UpdatePlanBody {
  planTitle?: string;
  isPlanVisible?: boolean;
  planDescription?: string;
  tripStartDate?: string;
  tripEndDate?: string;
}

export interface UpdatePlanResponse {
  planId: number;
}

// 플랜 장소 일괄 업데이트 (POST /api/plan-place/{planId}/update)
export interface UpdatePlanPlaceItem {
  planPlaceId?: number;
  placeId: number;
  order: number;
}

export interface UpdatePlanPlacesBody {
  departurePoint?: DeparturePoint;
  places: UpdatePlanPlaceItem[];
}

export interface UpdatePlanPlacesResponse {
  planId: number;
}

// 플랜 복제 (POST /api/plan/{planId}/clone)
export interface ClonePlanBody {
  scheduledDate?: string;
}

export interface ClonePlanResponse {
  planId: number;
  originalPlanId: number;
  createAt: string;
}

// 플랜 좋아요 (POST/DELETE /api/like/{planId})
export interface LikeResponse {
  isLiked: boolean;
  likeCount: number;
}

// 플랜 스크랩 토글 (POST /api/plan/scrapped/{planId})
export interface ScrapPlanResponse {
  planId: number;
  isBookmarked: boolean;
  bookmarkCount: number;
}

// 플랜 생성/수정 프리뷰 (POST /api/plan-place/preview, /api/plan-place/{planId}/preview)
export interface PlanPreviewPlace {
  placeId: number;
  placeName: string;
  addressName: string;
  roadAddressName: string;
  categoryName: string;
  duration: number;
  order: number;
  stayTime: number;
  isStamped: boolean;
  x: number;
  y: number;
}

export interface PlanPreviewResponse {
  planId?: number;
  planTitle: string;
  planDescription: string;
  isPlanVisible: boolean;
  requiredTime: number;
  totalDistance: number;
  departurePoint: DeparturePoint | null;
  tripStartDate: string;
  tripEndDate: string;
  places: PlanPreviewPlace[];
}

// 장소 스탬프 인증 (POST /api/plan-place/{planPlaceId}/stamp)
export interface StampPlanPlaceResponse {
  planPlaceId: number;
  isStamped: boolean;
  verifiedImage: string;
  stampedAt: string;
}

// 내 플랜 / 내 스크랩 목록 (GET /api/mypage/plans, /api/mypage/scrapped)
export interface PlanSummary {
  planId: number;
  planTitle: string;
  createAt: string;
  tripStartDate: string;
  tripEndDate: string;
  isPlanVisible: boolean;
  requiredTime: number;
  planImages: string[];
}

export interface MyPlansResponse {
  plans: PlanSummary[];
}

export interface ScrappedPlansResponse {
  scrappedPlans: PlanSummary[];
}
