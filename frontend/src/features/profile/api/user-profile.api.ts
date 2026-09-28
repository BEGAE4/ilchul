import apiClient from '@/shared/lib/api/apiClient';
import type { PaginatedResponse, PaginationParams } from '@/features/main/types/pagination.types';
import { normalizePagedList } from '@/shared/lib/api/normalizePagedList';
import { sortMyPlansNewest } from '@/features/my-page/utils/sortPlans';
import type {
  PublicUserProfile,
  PublicUserProfileSummary,
  PublicUserPlan,
  UserPlansResponse,
} from '../types/user-profile.types';

// 타 유저 공개 프로필 — 플랜 상세와 같이 백엔드를 직접 호출한다 (apiClient, 쿠키 동봉).
// 404 회원 없음 / 410 탈퇴한 사용자는 axios 오류로 올라오며 utils/userProfile.classifyUserProfileError 가 분기한다.

/** GET /api/profile/{userId} — 닉네임·프로필 이미지·소개 */
export async function fetchUserProfile(userId: number): Promise<PublicUserProfile> {
  const { data } = await apiClient.get<PublicUserProfile>(`/api/profile/${userId}`);
  return {
    userNickname: data?.userNickname ?? '',
    userImg: data?.userImg ?? null,
    userIntro: data?.userIntro ?? null,
  };
}

/** GET /api/profile/{userId}/summary — 공개 플랜·인증 플랜·받은 저장 수 */
export async function fetchUserProfileSummary(userId: number): Promise<PublicUserProfileSummary> {
  const { data } = await apiClient.get<PublicUserProfileSummary>(`/api/profile/${userId}/summary`);
  return {
    publicPlanCount: data?.publicPlanCount ?? 0,
    verifyPlanCount: data?.verifyPlanCount ?? 0,
    scrappedByOthersCount: data?.scrappedByOthersCount ?? 0,
  };
}

export type PublicUserPlanListItem = PublicUserPlan & { id: number };

/** GET /api/profile/{userId}/plans?page=&limit= — 공개 플랜 목록 한 페이지 (무한 스크롤).
 *  204(없음)는 본문이 비어 온다. 백엔드가 아직 페이징을 지원하지 않으면 전체가 한 번에 오고 hasNext=false. */
export async function fetchUserPlansPage(
  params: PaginationParams & { userId: number }
): Promise<PaginatedResponse<PublicUserPlanListItem>> {
  const { userId, ...paging } = params;
  const { data, status } = await apiClient.get<UserPlansResponse | ''>(`/api/profile/${userId}/plans`, {
    params: paging,
  });
  const body = status === 204 || !data || typeof data === 'string' ? null : data;
  // 마이페이지와 같이 생성 최신순으로 맞춘다
  const plans = sortMyPlansNewest(body?.plans ?? []).map((plan) => ({ ...plan, id: plan.planId }));
  return normalizePagedList(plans, body, paging);
}

/** GET /api/profile/{userId}/plans — 공개 플랜 목록. 204(없음)는 본문이 비어 오므로 [] 로 정규화 */
export async function fetchUserPlans(userId: number): Promise<PublicUserPlan[]> {
  const { data, status } = await apiClient.get<UserPlansResponse | ''>(`/api/profile/${userId}/plans`);
  if (status === 204 || !data || typeof data === 'string') return [];
  return data.plans ?? [];
}
