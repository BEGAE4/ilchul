package com.begae.backend.plan.controller;

import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.plan.dto.ScrappedPlanCreateResponseDto;
import com.begae.backend.plan.service.ScrappedPlanService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "플랜 스크랩", description = "플랜 스크랩 관련 API")
@Validated
@RestController
@RequestMapping("api/plan/scrapped")
@RequiredArgsConstructor
public class ScrappedPlanController {
    private final ScrappedPlanService scrappedPlanService;

    @Operation(summary = "플랜 스크랩 등록", description = "특정 플랜을 내 스크랩 목록에 등록합니다.")
    @ApiResponse(responseCode = "200", description = "플랜이 성공적으로 스크랩되었습니다.")
    @PostMapping("/{planId}")
    public ResponseEntity<ScrappedPlanCreateResponseDto> postPlanScrapped(
            @AuthenticationPrincipal OauthUserDetails userDetails,
            @Parameter(description = "스크랩할 플랜 ID", example = "1") @PathVariable @Positive Integer planId
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(scrappedPlanService.createPlanScrapped(userDetails.getUserId(), planId));
    }
}
