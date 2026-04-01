package com.begae.backend.plan.controller;

import com.begae.backend.plan.service.ScrappedPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/plan/scrapped")
@RequiredArgsConstructor
public class ScrappedPlanController {
    private final ScrappedPlanService scrappedPlanService;

    @PostMapping("/{planId}")
    public ResponseEntity<Integer> postPlanScrapped(@PathVariable Integer planId) {
        Integer userId = 1;
        return ResponseEntity.status(HttpStatus.OK)
                .body(scrappedPlanService.createPlanScrapped(userId, planId));
    }
}
