// 서버(Spring)가 받는 날짜 문자열 포맷.
// 플랜 생성/수정/미리보기 요청의 tripStartDate·tripEndDate 와 장소 추천의 startTime·endTime 은
// 모두 `@JsonFormat(pattern = "yyyy-MM-dd HH:mm")` 이라 ISO 8601(`2026-08-22T18:00:00`)을 보내면
// 역직렬화에 실패해 400 "잘못된 입력값입니다." 가 떨어진다. 공백 구분·초 없음으로 맞춘다.
//
//   toServerDateTime('2026-08-22', '18:00') → '2026-08-22 18:00'

export function toServerDateTime(date: string, time: string): string {
  return `${date.trim()} ${time.trim().slice(0, 5)}`.trim();
}
