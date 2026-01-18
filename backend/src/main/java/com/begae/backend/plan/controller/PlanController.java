package com.begae.backend.plan.controller;

import com.begae.backend.plan.dto.PlanDetailDto;
import com.begae.backend.plan.dto.PlanPreviewRequest;
import com.begae.backend.plan.dto.PlanPreviewResponse;
import com.begae.backend.plan.service.PlanService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/preview")
    public ResponseEntity<PlanPreviewResponse> postPlanPreview(@RequestBody PlanPreviewRequest planPreviewRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(planService.createPlanPreview(planPreviewRequest));
    }

    @GetMapping("/{planId}")
    public ResponseEntity<PlanDetailDto> getPlanDetail(@PathVariable Integer planId) {
        return ResponseEntity.status(HttpStatus.OK).body(planService.getPlanDetail(planId));
    }
}