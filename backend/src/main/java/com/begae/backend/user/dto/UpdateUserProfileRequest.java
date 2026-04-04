package com.begae.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileRequest {

    private String newUserNickname;
    private String newUserIntro;
    private String newUserProfileImg;
}
