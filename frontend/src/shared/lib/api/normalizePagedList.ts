import type { PaginatedResponse, PaginationParams } from '@/features/main/types/pagination.types';

// 목록 응답을 홈 인기 목록과 같은 페이지 형식(PaginatedResponse)으로 맞춘다.
// 백엔드가 아직 page/limit/hasNext/totalCount 를 주지 않는 목록(내 플랜·저장 플랜·타 사용자 플랜)은
// 전체가 한 번에 오므로 "첫 페이지가 곧 마지막" 으로 취급한다. 페이징 필드가 오기 시작하면 그대로 쓴다.
interface MaybePaged {
  page?: number;
  limit?: number;
  hasNext?: boolean;
  totalCount?: number;
}

export function normalizePagedList<T>(
  items: T[],
  body: MaybePaged | null | undefined,
  params: PaginationParams
): PaginatedResponse<T> {
  const page = typeof body?.page === 'number' ? body.page : (params.page ?? 1);
  const limit = typeof body?.limit === 'number' ? body.limit : (params.limit ?? items.length);
  const hasNext = typeof body?.hasNext === 'boolean' ? body.hasNext : false;
  const totalCount = typeof body?.totalCount === 'number' ? body.totalCount : items.length;
  return { status: 200, message: 'OK', data: items, page, limit, hasNext, totalCount };
}
