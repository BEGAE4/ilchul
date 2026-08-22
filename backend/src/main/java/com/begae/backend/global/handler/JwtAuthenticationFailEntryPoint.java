package com.begae.backend.global.handler;

import com.begae.backend.global.dto.ErrorResponse;
import com.begae.backend.global.exception.GlobalErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFailEntryPoint implements AuthenticationEntryPoint { // 인증 실패시

    private final ObjectMapper objectMapper;

    /**
     * REST API이므로 리다이렉트 대신 401을 그대로 응답한다.
     * fetch/XHR은 리다이렉트를 자동으로 따라가기 때문에 302로 응답하면
     * 클라이언트가 인증 실패 자체를 인지할 수 없다.
     */
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        GlobalErrorCode errorCode = GlobalErrorCode.UNAUTHORIZED;

        response.setStatus(errorCode.getHttpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(
                response.getWriter(),
                ErrorResponse.of(errorCode.getHttpStatus(), errorCode.getMessage())
        );
    }
}
