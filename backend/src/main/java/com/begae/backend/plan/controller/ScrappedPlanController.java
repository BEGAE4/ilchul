package com.begae.backend.plan.controller;

import com.begae.backend.plan.dto.ScrappedPlanCreateResponseDto;
import com.begae.backend.plan.service.ScrappedPlanService;
import com.begae.backend.global.security.principal.OauthUserDetails;
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

@Validated
@RestController
@RequestMapping("api/plan/scrapped")
@RequiredArgsConstructor
public class ScrappedPlanController {
    private final ScrappedPlanService scrappedPlanService;

    @PostMapping("/{planId}")
    public ResponseEntity<ScrappedPlanCreateResponseDto> postPlanScrapped(
            @PathVariable @Positive Integer planId,
            @AuthenticationPrincipal OauthUserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(scrappedPlanService.createPlanScrapped(userDetails.getUserId(), planId));
    }
}
