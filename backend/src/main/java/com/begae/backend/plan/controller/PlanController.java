package com.begae.backend.plan.controller;

import com.begae.backend.plan.dto.CreatePlanRequestDto;
import com.begae.backend.plan.service.PlanService;
import com.begae.backend.user.auth.OauthUserDetails;
import lombok.RequiredArgsConstructor;
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

    @PostMapping
    public ResponseEntity<Void> createPlan(@AuthenticationPrincipal OauthUserDetails oauthUserDetails,
                                         @RequestBody CreatePlanRequestDto createPlanRequestDto) {
        planService.createPlanWithPlaces(oauthUserDetails.getName(), createPlanRequestDto);
        return null;
    }
}
