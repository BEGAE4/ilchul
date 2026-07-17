package com.begae.backend.user.controller;

import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.global.security.jwt.JwtManager;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "인증", description = "사용자 인증, 로그아웃, 토큰 재발급 및 회원 탈퇴 관련 API")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sign")
public class SignController {

    private final JwtManager jwtManager;

    @GetMapping("/userinfo")
    @Operation(summary = "사용자 정보 조회", description = "현재 로그인한 사용자의 이메일과 권한 정보를 조회합니다.")
    @ApiResponse(responseCode = "200", description = "사용자 정보가 성공적으로 조회되었습니다.")
    public ResponseEntity<?> userInfo(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails oauthUserDetails
    ) {
        if(oauthUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(Map.of(
                "email", oauthUserDetails.getName(),
                "role", oauthUserDetails.getAuthorities()
        ));
    }


    @PostMapping("/logout")
    @Operation(summary = "로그아웃", description = "사용자의 리프레시 토큰을 삭제하고 인증 정보를 만료 처리합니다.")
    @ApiResponse(responseCode = "204", description = "로그아웃이 성공적으로 처리되었습니다.")
    public ResponseEntity<Void> logout(
            @Parameter(hidden = true) Authentication authentication,
            @Parameter(hidden = true) HttpServletRequest request,
            @Parameter(hidden = true) HttpServletResponse response
    ) {
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
    @Operation(summary = "토큰 재발급", description = "리프레시 토큰을 기반으로 액세스 토큰을 재발급합니다.")
    @ApiResponse(responseCode = "200", description = "토큰이 성공적으로 재발급되었습니다.")
    public ResponseEntity<String> reissueToken() {
        return new ResponseEntity<>("토큰 재발급 성공", HttpStatus.OK);
    }


    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteUser(@AuthenticationPrincipal OauthUserDetails user) {

        return ResponseEntity.ok().build();
    }
}
