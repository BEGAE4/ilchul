// 서버는 자기소개/프로필 이미지를 입력한 적 없으면 null 로 내려준다.
// (신규 가입자 GET /api/mypage/profile → { userIntro: null, userImg: null })
export interface MyPageProfile {
  userNickname: string;
  userImg: string | null;
  userIntro: string | null;
}

export interface UpdateProfileRequest {
  newUserNickname: string;
  newUserIntro: string;
  newUserProfileImg: string;
}

export interface UpdateProfileResponse {
  userNickname: string;
  userImg: string | null;
  userIntro: string | null;
}

