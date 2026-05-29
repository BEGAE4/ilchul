package com.begae.backend.plan.controller;

import com.begae.backend.plan.dto.PlanCopyResponseDto;
import com.begae.backend.plan.dto.PlanDetailDto;
import com.begae.backend.plan.service.PlanService;
import com.begae.backend.user.auth.OauthUserDetails;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("api/plan")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @GetMapping
    public ResponseEntity<Void> getPlanByLikeCount() {
        return null;
    }

//    @PostMapping("/preview")
//    public ResponseEntity<PlanPreviewResponse> postPlanPreview(@RequestBody PlanPreviewRequest planPreviewRequest) {
//        return ResponseEntity.status(HttpStatus.OK).body(planService.createPlanPreview(planPreviewRequest));
//    }
//
    @GetMapping("/{planId}")
    public ResponseEntity<PlanDetailDto> getPlanDetail(@PathVariable @Positive Integer planId) {
        return ResponseEntity.status(HttpStatus.OK).body(planService.getPlanDetail(planId));
    }

    @PostMapping("/copy/{planId}")
    public ResponseEntity<PlanCopyResponseDto> copyPlan(
            @PathVariable @Positive Integer planId,
            @AuthenticationPrincipal OauthUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.OK).body(planService.copyPlan(planId, userDetails.getUserId()));
    }
}