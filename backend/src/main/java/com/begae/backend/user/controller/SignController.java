package com.begae.backend.user.controller;

import com.begae.backend.user.auth.OauthUserDetails;
import com.begae.backend.user.jwt.JwtManager;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sign")
public class SignController {

    private final JwtManager jwtManager;

    @GetMapping("/userinfo")
    public ResponseEntity<?> userInfo(@AuthenticationPrincipal OauthUserDetails oauthUserDetails) {
        if(oauthUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        log.info(oauthUserDetails.getName());
        return ResponseEntity.ok(Map.of(
                "email", oauthUserDetails.getName(),
                "role", oauthUserDetails.getAuthorities()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication,
                                       HttpServletRequest request, HttpServletResponse response) {
        jwtManager.deleteRefreshToken(request, "RefreshToken");

        new SecurityContextLogoutHandler().logout(request, response, authentication);

        ResponseCookie expiredAccess = ResponseCookie.from("AccessToken", null)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(0)
                .build();

        ResponseCookie expiredRefresh = ResponseCookie.from("RefreshToken", null)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader("Set-Cookie", expiredAccess.toString());
        response.addHeader("Set-Cookie", expiredRefresh.toString());

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reissue")
    public ResponseEntity<String> reissueToken() {
        return new ResponseEntity<>("토큰 재발급 성공", HttpStatus.OK);
    }
}
