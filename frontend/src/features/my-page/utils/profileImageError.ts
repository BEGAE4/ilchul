// 프로필 사진 업로드 실패 안내. 413 은 앞단(nginx)이 HTML 로 답해 본문을 읽을 수 없으므로 상태코드로만 나눈다.
export function profileImageErrorMessage(err: unknown): string {
  const e = err as { isAxiosError?: boolean; response?: { status?: number } } | null;
  if (e?.isAxiosError) {
    const status = e.response?.status;
    if (status === undefined) return '네트워크 연결을 확인한 뒤 다시 시도해주세요.';
    if (status === 400) return 'JPG, PNG, WEBP 사진만 올릴 수 있어요.';
    if (status === 413) return '사진 용량이 너무 커요. 다른 사진으로 시도해주세요.';
    if (status === 401) return '로그인이 필요해요. 다시 로그인해주세요.';
  }
  return '사진을 올리지 못했어요. 잠시 후 다시 시도해주세요.';
}
