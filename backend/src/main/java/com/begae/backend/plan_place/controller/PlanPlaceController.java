package com.begae.backend.plan_place.controller;

import com.begae.backend.plan.service.PlanService;
import com.begae.backend.plan_place.service.PlanPlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/plan-place")
@RequiredArgsConstructor
public class PlanPlaceController {

    private final PlanPlaceService planPlaceService;
}
