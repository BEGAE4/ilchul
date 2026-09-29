// 로그인 여부 확인 응답 타입
export interface UserRole {
  authority: string;
}

export interface UserInfo {
  // 내 숫자 id. 2026-09-18 백엔드 추가 (2차 요청 8-2). 구버전 응답 대비로 optional
  userId?: number;
  role: UserRole[];
  email: string;
}
