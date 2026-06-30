package com.begae.backend.like.controller;

import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.like.dto.LikeResponseDto;
import com.begae.backend.like.service.LikeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "좋아요", description = "플랜 좋아요 관련 API")
@Validated
@RestController
@RequestMapping("/api/like")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    /**
     * 플랜 좋아요 등록 (멱등성 보장)
     */
    @PostMapping("/{planId}")
    @Operation(summary = "플랜 좋아요 등록", description = "특정 플랜에 좋아요를 등록합니다.")
    @ApiResponse(responseCode = "200", description = "좋아요가 성공적으로 등록되었습니다.")
    public ResponseEntity<LikeResponseDto> likePlan(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails userDetails,
            @Parameter(description = "플랜 ID", example = "1") @PathVariable @Positive Integer planId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(likeService.likePlan(planId, userDetails.getUserId()));
    }

    /**
     * 플랜 좋아요 취소 (멱등성 보장)
     */
    @DeleteMapping("/{planId}")
    @Operation(summary = "플랜 좋아요 취소", description = "특정 플랜에 등록된 좋아요를 취소합니다.")
    @ApiResponse(responseCode = "200", description = "좋아요가 성공적으로 취소되었습니다.")
    public ResponseEntity<LikeResponseDto> unlikePlan(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails userDetails,
            @Parameter(description = "플랜 ID", example = "1") @PathVariable @Positive Integer planId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(likeService.unlikePlan(planId, userDetails.getUserId()));
    }
}
