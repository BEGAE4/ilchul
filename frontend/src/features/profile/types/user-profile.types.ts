// 타 유저 공개 프로필 (스웨거 태그 '유저프로필', GET /api/profile/{userId}…)
// 경로 키는 숫자 userId — 플랜 상세(PlanDetailDto.userId)와 같은 값이다.

/** GET /api/profile/{userId} → UserProfileResponseDto. 소개·이미지는 입력한 적 없으면 null */
export interface PublicUserProfile {
  userNickname: string;
  userImg: string | null;
  userIntro: string | null;
}

/** GET /api/profile/{userId}/summary → PublicUserProfileSummaryResponseDto.
 *  마이페이지 요약과 달리 savedCourseCount(내가 저장한 수)는 남에게 보여주지 않는다. */
export interface PublicUserProfileSummary {
  publicPlanCount: number;
  verifyPlanCount: number;
  scrappedByOthersCount: number;
}

/** GET /api/profile/{userId}/plans 의 항목 (PlanSummary). 공개 플랜만 내려오므로 isPlanVisible 없음.
 *  planVerified·bookmarkCount 는 카드 배지용으로 백엔드에 추가 요청한 상태 — 오기 전까지는 optional. */
export interface PublicUserPlan {
  planId: number;
  planTitle: string;
  createAt: string | null;
  tripStartDate: string | null;
  tripEndDate: string | null;
  requiredTime: number;
  planImages: string[];
  planVerified?: boolean;
  bookmarkCount?: number;
}

export interface UserPlansResponse {
  plans: PublicUserPlan[];
}

/** 프로필 조회가 실패했을 때 화면이 갈라지는 종류 */
export type UserProfileErrorKind = 'not-found' | 'withdrawn' | 'error';
