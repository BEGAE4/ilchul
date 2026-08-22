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
  startTime: string;
  endTime: string;
  transport: string;
  location: { x: number; y: number };
  // 명세 260819에서 부활한 필드(int32). 단위/'상관없어요' 표현이 BE와 합의되지 않아 아직 보내지 않는다.
  // TODO(transportTime): 합의 후 설문 질문과 함께 복구한다.
  transportTime?: number;
}

// 장소 추천 응답 — 서버는 키워드별로 묶인 그룹 배열(List<RecommendPlaceResponseDto>)을 돌려준다.
// 명세 260819의 200 응답이 `type: object`로 비어 있어(컨트롤러가 ResponseEntity<?>) 명세만으로는 알 수 없고,
// 백엔드 PlaceController.recommendPlace() 반환 타입을 근거로 삼았다.
export interface RecommendPlaceGroup {
  keyword: string;
  radiusM: number;
  places: SearchPlaceItem[];
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
