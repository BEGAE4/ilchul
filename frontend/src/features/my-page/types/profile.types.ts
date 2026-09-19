// 서버는 자기소개/프로필 이미지를 입력한 적 없으면 null 로 내려준다.
// (신규 가입자 GET /api/mypage/profile → { userIntro: null, userImg: null })
export interface MyPageProfile {
  userNickname: string;
  userImg: string | null;
  userIntro: string | null;
}

// 사진은 이 요청으로 바꾸지 않는다. 2026-09-18 부터 서버가 newUserProfileImg 를 무시하고 기존 사진을 유지한다 —
// 사진 변경·삭제는 POST/DELETE /api/mypage/profile/image (uploadProfileImage / deleteProfileImage)
export interface UpdateProfileRequest {
  newUserNickname: string;
  newUserIntro: string;
}

export interface UpdateProfileResponse {
  userNickname: string;
  userImg: string | null;
  userIntro: string | null;
}

