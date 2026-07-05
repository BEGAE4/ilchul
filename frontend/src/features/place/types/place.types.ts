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

// 인기 장소 (PopularPlaceItemDto / PopularPlaceResponseDto)
export interface PopularPlaceItem {
  id: number;
  name: string;
  category: string;
  location: string;
  image: string;
  ranking: number;
}

export interface PopularPlaceResponse {
  status: number;
  message: string;
  data: PopularPlaceItem[];
  page: number;
  limit: number;
  hasNext: boolean;
  totalCount: number;
}

// 장소 추천 요청 (SurveyResultDto)
export interface SurveyResult {
  emotion: string;
  startTime: string;
  endTime: string;
  transport: string;
  location: { x: number; y: number };
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
