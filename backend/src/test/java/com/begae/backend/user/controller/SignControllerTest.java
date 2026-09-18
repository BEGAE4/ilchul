package com.begae.backend.user.controller;

import com.begae.backend.global.security.jwt.JwtManager;
import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.user.dto.SignUserInfoResponseDto;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class SignControllerTest {

    @Test
    void 로그인_정보에_현재_사용자_ID를_포함한다() {
        SignController controller = new SignController(mock(JwtManager.class));
        OauthUserDetails principal = new OauthUserDetails(
                42,
                "user@example.com",
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of()
        );

        ResponseEntity<SignUserInfoResponseDto> response = controller.userInfo(principal);

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().userId()).isEqualTo(42);
    }
}
