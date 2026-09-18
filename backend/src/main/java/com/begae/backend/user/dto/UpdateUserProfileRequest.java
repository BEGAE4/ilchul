package com.begae.backend.user.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties("newUserProfileImg")
public class UpdateUserProfileRequest {

    private String newUserNickname;
    private String newUserIntro;
}
