// 플랜 카드에 찍는 날짜·소요시간 문구. 마이페이지 내 플랜/저장 플랜과 타 유저 공개 플랜 카드가 같이 쓴다.

/** 'yyyy-MM-dd HH:mm' 또는 ISO → '2026. 09. 12.' (ko-KR). 없으면 '생성일 미정' */
export function formatIsoDate(iso: string | null | undefined): string {
  if (!iso) return '생성일 미정';
  // 서버 날짜는 'yyyy-MM-dd HH:mm' 형식 — Safari/iOS 호환을 위해 ISO(T)로 정규화
  const d = new Date(iso.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** 여행 기간 (시작~종료). 시작만 있으면 시작일만, 없으면 '일정 미정' */
export function formatTripPeriod(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  if (!start) return '일정 미정';
  const startText = formatIsoDate(start);
  if (!end) return startText;
  const endText = formatIsoDate(end);
  return startText === endText ? startText : `${startText} ~ ${endText}`;
}

/** 소요 시간(분) → 'N시간 M분'. 0 이하·없음이면 '소요 시간 미정' */
export function formatRequiredTime(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '소요 시간 미정';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
}
