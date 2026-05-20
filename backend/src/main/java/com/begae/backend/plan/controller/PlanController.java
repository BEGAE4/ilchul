package com.begae.backend.plan.controller;

import com.begae.backend.plan.dto.*;
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

    @PatchMapping("/{planId}")
    public ResponseEntity<Integer> updatePlan(@AuthenticationPrincipal OauthUserDetails user,
                                           @PathVariable Integer planId,
                                           @RequestBody UpdatePlanRequestDto request) {
        // 이름, 사진, 공개여부, 설명은 변경가능
        // 나머지(출발지, 여행시작/여행종료일자)는 인증 여부 검사
        return ResponseEntity.ok(planService.updatePlan(user.getUserId(), planId, request));
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deletePlan(@AuthenticationPrincipal OauthUserDetails user,
                                           @PathVariable Integer planId) {
        planService.deletePlan(user.getUserId(), planId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}