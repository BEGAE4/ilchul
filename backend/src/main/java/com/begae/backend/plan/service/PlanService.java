package com.begae.backend.plan.service;

import com.begae.backend.plan.dto.CreatePlanRequestDto;
import com.begae.backend.plan.dto.CreatePlanResponseDto;
import com.begae.backend.plan.dto.PlanCopyResponseDto;
import com.begae.backend.plan.dto.PlanDetailDto;

public interface PlanService {

    void findPlanByLikeCount();

//    PlanPreviewResponse createPlanPreview(PlanPreviewRequest planPreviewRequest);

    CreatePlanResponseDto CreatePlanWithPlaces(Integer userId, CreatePlanRequestDto request);

    PlanDetailDto getPlanDetail(Integer planId);

    PlanCopyResponseDto copyPlan(Integer planId, Integer userId);
}
