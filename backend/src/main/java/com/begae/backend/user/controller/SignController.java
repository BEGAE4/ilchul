package com.begae.backend.user.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sign")
public class SignController {

    @GetMapping("/login/kakao")
    public ResponseEntity<String> loginKakao() {
        return new ResponseEntity<>("로그인 성공", HttpStatus.OK);
    }

    @GetMapping("/reissue")
    public ResponseEntity<String> reissueToken() {
        return new ResponseEntity<>("토큰 재발급 성공", HttpStatus.OK);
    }
}
