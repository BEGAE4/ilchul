package com.begae.backend.global.handler;

import com.begae.backend.global.exception.GlobalErrorCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.InsufficientAuthenticationException;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityFailureHandlerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void authenticationFailureReturnsJson401WithoutRedirect() throws Exception {
        JwtAuthenticationFailEntryPoint entryPoint = new JwtAuthenticationFailEntryPoint(objectMapper);
        MockHttpServletResponse response = new MockHttpServletResponse();

        entryPoint.commence(
                new MockHttpServletRequest(),
                response,
                new InsufficientAuthenticationException("Authentication required")
        );

        JsonNode body = objectMapper.readTree(response.getContentAsString());
        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getRedirectedUrl()).isNull();
        assertThat(response.getContentType()).startsWith("application/json");
        assertThat(body.get("status").asInt()).isEqualTo(401);
        assertThat(body.get("message").asText()).isEqualTo(GlobalErrorCode.UNAUTHORIZED.getMessage());
    }

    @Test
    void accessDeniedReturnsJson403WithoutRedirect() throws Exception {
        JwtAccessDeniedHandler handler = new JwtAccessDeniedHandler(objectMapper);
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.handle(
                new MockHttpServletRequest(),
                response,
                new AccessDeniedException("Forbidden")
        );

        JsonNode body = objectMapper.readTree(response.getContentAsString());
        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getRedirectedUrl()).isNull();
        assertThat(response.getContentType()).startsWith("application/json");
        assertThat(body.get("status").asInt()).isEqualTo(403);
        assertThat(body.get("message").asText()).isEqualTo(GlobalErrorCode.HANDLE_ACCESS_DENIED.getMessage());
    }
}
