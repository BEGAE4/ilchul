package com.begae.backend.plan_place.controller;

import com.begae.backend.plan.service.PlanService;
import com.begae.backend.plan_place.dto.CalculateDurationRequestDto;
import com.begae.backend.plan_place.dto.KakaoNaviRequestDto;
import com.begae.backend.plan_place.service.PlanPlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/plan-place")
@RequiredArgsConstructor
public class PlanPlaceController {

    private final PlanPlaceService planPlaceService;

    @PostMapping("/duration")
    public ResponseEntity<?> getDuration(@RequestBody CalculateDurationRequestDto request) {
        return ResponseEntity.ok().body(planPlaceService.calculateDuration(request));
    }
}
