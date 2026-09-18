package com.begae.backend.global.security.principal;

import com.begae.backend.storage.dto.StoredImage;
import com.begae.backend.storage.service.SocialProfileImageStorageService;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CustomUserDetailsServiceProfileSyncTest {

    @Test
    void 기존_사용자의_빈_프로필을_저장소에_복사한_소셜_이미지로_채운다() {
        User user = User.builder().userNickname("사용자").build();
        SocialProfileImageStorageService storage = mock(SocialProfileImageStorageService.class);
        when(storage.uploadFromUrl("https://social.example.com/profile.png", "users/profile"))
                .thenReturn(Optional.of(new StoredImage(
                        "users/profile/social.png",
                        "https://cdn.example.com/users/profile/social.png",
                        "social.png",
                        "image/png",
                        100L
                )));
        CustomUserDetailsService service = new CustomUserDetailsService(mock(UserRepository.class), storage);

        service.synchronizeSocialProfileImage(user, "https://social.example.com/profile.png");

        assertThat(user.getUserImg()).isEqualTo("https://cdn.example.com/users/profile/social.png");
        assertThat(user.getUserImgKey()).isEqualTo("users/profile/social.png");
    }
}
