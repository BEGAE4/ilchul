package com.begae.backend.user.dto;

import com.begae.backend.user.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDto {
    private String userNickname;
    private String userImg;
    private String userIntro;

    public static UserProfileResponseDto from(User user) {
        return new UserProfileResponseDto(
                user.getUserNickname(),
                user.getUserImg(),
                user.getUserIntro()
        );
    }
}
