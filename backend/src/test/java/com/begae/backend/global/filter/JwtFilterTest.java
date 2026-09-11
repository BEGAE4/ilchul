package com.begae.backend.global.filter;

import com.begae.backend.global.handler.JwtAuthenticationFailEntryPoint;
import com.begae.backend.global.security.jwt.JwtManager;
import com.begae.backend.user.common.TokenStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class JwtFilterTest {

    @Test
    void missingStoredRefreshTokenReturns401InsteadOfThrowing() throws Exception {
        JwtManager jwtManager = mock(JwtManager.class);
        JwtAuthenticationFailEntryPoint entryPoint = new JwtAuthenticationFailEntryPoint(new ObjectMapper());
        JwtFilter filter = new JwtFilter(jwtManager, entryPoint);
        FilterChain filterChain = mock(FilterChain.class);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/plan/1");
        request.setCookies(
                new Cookie("AccessToken", "expired-access"),
                new Cookie("RefreshToken", "valid-but-missing")
        );
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtManager.validateToken("expired-access")).thenReturn(TokenStatus.EXPIRED);
        when(jwtManager.validateToken("valid-but-missing")).thenReturn(TokenStatus.VALID);
        when(jwtManager.reissueAccessToken("valid-but-missing")).thenReturn(Optional.empty());

        filter.doFilter(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getRedirectedUrl()).isNull();
        assertThat(response.getContentAsString()).contains("로그인이 필요한 요청입니다.");
        verifyNoInteractions(filterChain);
    }
}
