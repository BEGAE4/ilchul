package com.begae.backend.plan.service;

import com.begae.backend.plan.dto.ScrappedPlanCreateResponseDto;
import com.begae.backend.plan.dto.ScrappedPlanResponseDto;

public interface ScrappedPlanService {

    ScrappedPlanCreateResponseDto createPlanScrapped(Integer userId, Integer planId);

    ScrappedPlanResponseDto findUserScrappedPlan(Integer userId);
}
