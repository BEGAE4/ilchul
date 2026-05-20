package com.begae.backend.plan.controller;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.GlobalErrorCode;
import com.begae.backend.plan.dto.PlanCopyResponseDto;
import com.begae.backend.plan.dto.PlanDetailDto;
import com.begae.backend.plan.dto.PopularPlanResponseDto;
import com.begae.backend.plan.service.PlanService;
import com.begae.backend.user.auth.OauthUserDetails;
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
        return ResponseEntity.status(HttpStatus.OK)
                .body(planService.getPlanDetail(planId));
    }

    @PostMapping("/copy/{planId}")
    public ResponseEntity<PlanCopyResponseDto> copyPlan(
            @PathVariable Integer planId,
            @AuthenticationPrincipal OauthUserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(planService.copyPlan(planId, userDetails.getUserId()));
    }

    /**
     * 내 주변 인기 플랜 조회
     * @param lat
     * @param lng
     * @param limit
     * @param page
     * @return
     */
    @GetMapping("/popular")
    public ResponseEntity<PopularPlanResponseDto> getPopularPlans(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "5") Integer limit,
            @RequestParam(defaultValue = "1") Integer page
    ) {
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new CustomException(GlobalErrorCode.INVALID_INPUT_VALUE);
        }
        return ResponseEntity.ok(planService.getPopularPlans(lat, lng, limit, page));
    }

    /**
     * 전국 인기 플랜 조회
     * @param limit
     * @param page
     * @return
     */
    @GetMapping("/popular/nationwide")
    public ResponseEntity<PopularPlanResponseDto> getNationwidePopularPlans(
            @RequestParam(defaultValue = "3") Integer limit,
            @RequestParam(defaultValue = "1") Integer page
    ) {
        return ResponseEntity.ok(planService.getNationwidePopularPlans(limit, page));
    }
}