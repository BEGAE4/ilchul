package com.begae.backend.plan.service;

import com.begae.backend.plan.dto.ScrappedPlanResponseDto;

public interface ScrappedPlanService {

    Integer createPlanScrapped(Integer userId, Integer planId);

    ScrappedPlanResponseDto findUserScrappedPlan(Integer userId);
}
