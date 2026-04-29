export interface MyPageProfile {
  userNickname: string;
  userImg: string;
  userIntro: string;
}

export interface UpdateProfileRequest {
  newUserNickname: string;
  newUserIntro: string;
  newUserProfileImg: string;
}

export interface UpdateProfileResponse {
  userNickname: string;
  userImg: string;
  userIntro: string;
}

