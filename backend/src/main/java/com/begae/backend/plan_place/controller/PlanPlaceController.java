package com.begae.backend.plan_place.controller;

import com.begae.backend.plan_place.dto.CreatePlanPreviewRequestDto;
import com.begae.backend.plan_place.dto.CreatePlanPreviewResponseDto;
import com.begae.backend.plan_place.service.PlanPlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/plan-place")
@RequiredArgsConstructor
public class PlanPlaceController {

    private final PlanPlaceService planPlaceService;

    @PostMapping("/preview")
    public ResponseEntity<CreatePlanPreviewResponseDto> getCreatePlanPreview(@RequestBody CreatePlanPreviewRequestDto request) {
        return ResponseEntity.ok().body(planPlaceService.createPlanPreview(request));
    }

    @PostMapping("/{planId}/preview")
    public ResponseEntity<?> getUpdatePlanPreview(@PathVariable Integer planId) {
        return ResponseEntity.ok().build();
    }
}
