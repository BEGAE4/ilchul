package com.begae.backend.user.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UpdateUserProfileRequestCompatibilityTest {

    @Test
    void 구버전_클라이언트의_이미지_URL_필드는_무시하고_프로필_텍스트를_읽는다() throws Exception {
        String json = """
                {
                  "newUserNickname": "새 닉네임",
                  "newUserIntro": "새 소개",
                  "newUserProfileImg": "https://untrusted.example.com/profile.png"
                }
                """;

        UpdateUserProfileRequest request = new ObjectMapper()
                .readValue(json, UpdateUserProfileRequest.class);

        assertThat(request.getNewUserNickname()).isEqualTo("새 닉네임");
        assertThat(request.getNewUserIntro()).isEqualTo("새 소개");
    }
}
