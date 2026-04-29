package com.begae.backend.plan.controller;

import com.begae.backend.plan.dto.ScrappedPlanCreateResponseDto;
import com.begae.backend.plan.service.ScrappedPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/plan/scrapped")
@RequiredArgsConstructor
public class ScrappedPlanController {
    private final ScrappedPlanService scrappedPlanService;

    @PostMapping("/{planId}")
    public ResponseEntity<ScrappedPlanCreateResponseDto> postPlanScrapped(@PathVariable Integer planId) {
        Integer userId = 1;
        return ResponseEntity.status(HttpStatus.OK)
                .body(scrappedPlanService.createPlanScrapped(userId, planId));
    }
}
