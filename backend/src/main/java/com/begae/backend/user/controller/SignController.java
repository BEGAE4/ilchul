package com.begae.backend.user.controller;

import com.begae.backend.user.auth.OauthUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sign")
public class SignController {

    @GetMapping("/login/kakao")
    public ResponseEntity<String> loginKakao() {
        return new ResponseEntity<>("카카오 로그인 성공", HttpStatus.OK);
    }

    @GetMapping("/login/google")
    public ResponseEntity<String> loginGoogle() {
        return new ResponseEntity<>("구글 로그인 성공", HttpStatus.OK);
    }

    @GetMapping("/login/naver")
    public ResponseEntity<String> loginNaver() {
        return new ResponseEntity<>("네이버 로그인 성공", HttpStatus.OK);
    }

    @GetMapping("/userinfo")
    public ResponseEntity<?> userInfo(@AuthenticationPrincipal OauthUserDetails oauthUserDetails) {
        if(oauthUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(Map.of(
                "email", oauthUserDetails.getName(),
                "role", oauthUserDetails.getAuthorities()
        ));
    }

    @GetMapping("/reissue")
    public ResponseEntity<String> reissueToken() {
        return new ResponseEntity<>("토큰 재발급 성공", HttpStatus.OK);
    }
}
