package com.begae.backend.global.filter;

import com.begae.backend.user.common.TokenStatus;
import com.begae.backend.global.security.jwt.JwtDto;
import com.begae.backend.global.security.jwt.JwtManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private static final String ACCESS_COOKIE = "AccessToken";
    private static final String REFRESH_COOKIE = "RefreshToken";

    private final JwtManager jwtManager;
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        return path.startsWith("/api/sign")
                || path.startsWith("/api/exception")
                || path.startsWith("/oauth2")
                || path.startsWith("/login/oauth2")
                || path.equals("/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String accessToken = getCookieValue(request, ACCESS_COOKIE);

        if (accessToken == null) {
            filterChain.doFilter(request, response);
            return;
        }


        TokenStatus tokenStatus = jwtManager.validateToken(accessToken);

        if(tokenStatus == TokenStatus.VALID) {
            SecurityContextHolder.getContext().setAuthentication(jwtManager.getAuthentication(accessToken));
            filterChain.doFilter(request, response);
            return;
        }

        if(tokenStatus == TokenStatus.EXPIRED) {
            String refreshToken = getCookieValue(request, REFRESH_COOKIE);
            if (refreshToken != null && jwtManager.validateToken(refreshToken) == TokenStatus.VALID) {
                JwtDto jwtDto = jwtManager.reissueAccessToken(refreshToken);

                setTokenCookies(response, jwtDto);

                SecurityContextHolder.getContext()
                        .setAuthentication(jwtManager.getAuthentication(jwtDto.getAccessToken()));

                filterChain.doFilter(request, response);
                return;
            }
        }

        SecurityContextHolder.clearContext();
        filterChain.doFilter(request, response);
    }

    private String getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals(name)) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private void setTokenCookies(HttpServletResponse response, JwtDto jwtDto) throws IOException {

        ResponseCookie accessToken = ResponseCookie.from("AccessToken", jwtDto.getAccessToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(jwtManager.getAccessTokenValidityTime())
                .build();

        ResponseCookie refreshToken = ResponseCookie.from("RefreshToken", jwtDto.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(jwtManager.getRefreshTokenValidityTime())
                .build();

        response.addHeader("Set-Cookie", accessToken.toString());
        response.addHeader("Set-Cookie", refreshToken.toString());

    }
}
