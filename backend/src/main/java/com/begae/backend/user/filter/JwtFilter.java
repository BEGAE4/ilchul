package com.begae.backend.user.filter;

import com.begae.backend.user.dto.JwtDto;
import com.begae.backend.user.jwt.JwtManager;
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
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (isRequestPassURI(request, response, filterChain)) {
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = getCookieValue(request, ACCESS_COOKIE);

        if(jwtManager.validateToken(accessToken) && jwtManager.validateExpired(accessToken)) {
            SecurityContextHolder.getContext().setAuthentication(jwtManager.getAuthentication(accessToken));
        }

        if(!jwtManager.validateExpired(accessToken) && jwtManager.validateToken(accessToken)) {
            String refreshToken = getCookieValue(request, REFRESH_COOKIE);
            if (jwtManager.validateToken(refreshToken) && jwtManager.validateExpired(refreshToken)) {
                JwtDto jwtDto = jwtManager.reissueAccessToken(refreshToken);
                SecurityContextHolder.getContext()
                        .setAuthentication(jwtManager.getAuthentication(jwtDto.getAccessToken()));

                redirectReissueURI(request, response, jwtDto);

            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRequestPassURI(HttpServletRequest req, HttpServletResponse res, FilterChain chain) {
        String path = req.getRequestURI();
        return path.startsWith("/api/sign/login") || path.startsWith("/api/exception");
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

    private void redirectReissueURI(HttpServletRequest request, HttpServletResponse response, JwtDto jwtDto) throws IOException {

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

        response.sendRedirect("/api/sign/reissue");
    }
}
