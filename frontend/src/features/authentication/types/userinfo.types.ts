// 로그인 여부 확인 응답 타입
export interface UserRole {
  authority: string;
}

export interface UserInfo {
  role: UserRole[];
  email: string;
}
