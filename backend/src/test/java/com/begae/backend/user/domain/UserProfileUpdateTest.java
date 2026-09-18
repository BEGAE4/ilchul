package com.begae.backend.user.domain;

import com.begae.backend.user.common.SocialType;
import com.begae.backend.user.common.UserRole;
import com.begae.backend.user.common.UserStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserProfileUpdateTest {

    @Test
    void 이미지_입력_없이_프로필을_수정하면_기존_이미지를_유지한다() {
        User user = User.builder()
                .userEmail("user@example.com")
                .socialType(SocialType.SOCIAL_KAKAO)
                .userNickname("기존")
                .userRole(UserRole.ROLE_USER)
                .userStatus(UserStatus.STATUS_AVAILABLE)
                .userImg("https://cdn.example.com/users/profile/old.png")
                .build();

        user.updateUserProfile("새 닉네임", "새 소개");

        assertThat(user.getUserImg()).isEqualTo("https://cdn.example.com/users/profile/old.png");
    }
}
