package com.begae.backend.plan.controller;

import com.begae.backend.plan.dto.CreatePlanRequestDto;
import com.begae.backend.plan.dto.CreatePlanResponseDto;
import com.begae.backend.plan.dto.PlanCopyResponseDto;
import com.begae.backend.plan.dto.PlanDetailDto;
import com.begae.backend.plan.service.PlanService;
import com.begae.backend.global.security.principal.OauthUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<PlanDetailDto> getPlanDetail(@PathVariable Integer planId) {
        return ResponseEntity.status(HttpStatus.OK).body(planService.getPlanDetail(planId));
    }

    @PostMapping("/copy/{planId}")
    public ResponseEntity<PlanCopyResponseDto> copyPlan(@PathVariable Integer planId) {
        int userId = 1;
        return ResponseEntity.status(HttpStatus.OK).body(planService.copyPlan(planId, userId));
    }

    @PostMapping("/create")
    public ResponseEntity<CreatePlanResponseDto> createPlan(@AuthenticationPrincipal OauthUserDetails user,
                                                            @RequestBody CreatePlanRequestDto request) {
        return ResponseEntity.ok(planService.CreatePlanWithPlaces(user.getUserId(), request));
    }
}