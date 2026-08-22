// PLACE API (v5) 타입 정의 — cc/api/v5/260705-v5-003-place.md 기준

// 장소 상세 조회 응답 (PlaceDetailResponseDto)
export interface PlaceDetail {
  placeId: number;
  placeName: string;
  addressName: string;
  roadAddressName: string;
  categoryName: string;
  phone: string;
  placeUrl: string;
  placeImageUrl: string;
  x: number;
  y: number;
}

// 장소 검색 응답 항목 (SearchPlaceResponseDto)
export interface SearchPlaceItem {
  placeId: number;
  placeImageUrl: string;
  categoryName: string;
  placeName: string;
  x: number;
  y: number;
}

// 인기 장소 타입은 main feature(popular-place.types.ts)에서 담당한다.

// 장소 추천 요청 (SurveyResultDto)
export interface SurveyResult {
  emotion: string;
  // 'YYYY-MM-DD HH:mm' (예: '2026-08-22 10:00')
  startTime: string;
  endTime: string;
  transport: string;
  location: { x: number; y: number };
  // 설문 선택지 문자열 그대로 전달 (예: '1시간 이내', '상관없어요', '1시간 30분')
  transportTime: string;
}

// 장소 추천 응답 (확정, 260822) — AI가 순서까지 정한 플랜 객체를 돌려준다.
//   { recommendId, candidateCount, plan, items: [{ order, placeId, ... }] }
export interface RecommendPlaceItem {
  order: number;
  placeId: number;
  placeName: string;
  categoryName: string;
  placeImageUrl: string;
  roadAddressName: string;
  x: number;
  y: number;
  stayMinutes: number;
  reason: string;
  tags: string[];
  wellnessCertified: boolean;
}

export interface RecommendResponse {
  recommendId: string;
  candidateCount: { wellness: number; kakao: number };
  plan: {
    totalHours: number;
    estimatedPlaceCount: number;
    reasoning: string;
  };
  items: RecommendPlaceItem[];
}

// 장소 좋아요 응답 (LikeResponseDto)
export interface PlaceLikeResponse {
  isLiked: boolean;
  likeCount: number;
}

// 장소 스크랩 응답 (ScrappedPlaceCreateResponseDto)
export interface PlaceScrapResponse {
  placeId: number;
  isBookmarked: boolean;
  bookmarkCount: number;
}

// 장소 후기 (PlaceReviewResponseDto / PlaceReviewListResponseDto)
export interface PlaceReview {
  reviewId: number;
  userId: number;
  userNickname: string;
  userImg: string;
  content: string;
  createAt: string;
}

export interface PlaceReviewListResponse {
  status: number;
  message: string;
  data: PlaceReview[];
  hasNext: boolean;
}

export interface WritePlaceReviewBody {
  content: string; // 최대 1000자
}

// 장소가 포함된 코스 (PopularPlanItemDto)
export interface PlaceContainingPlan {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  location: string;
  duration: string;
  likes: number;
  ranking: number;
}
