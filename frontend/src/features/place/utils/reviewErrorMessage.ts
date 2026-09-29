// 장소 후기 수정·삭제 실패 안내. 서버는 남의 후기에 403, 없는 후기에 404 를 준다 (2026-09-18 운영 확인).
export function reviewErrorMessage(err: unknown, action: '수정' | '삭제'): string {
  const e = err as { isAxiosError?: boolean; response?: { status?: number } } | null;
  const status = e?.isAxiosError ? e.response?.status : undefined;
  if (status === 403) return `내가 쓴 후기만 ${action}할 수 있어요.`;
  if (status === 404) return '이미 삭제된 후기예요.';
  if (status === 401) return '로그인이 필요해요. 다시 로그인해주세요.';
  return `후기를 ${action}하지 못했어요. 잠시 후 다시 시도해주세요.`;
}
