package com.begae.backend.plan.service;

import com.begae.backend.plan.dto.*;

public interface PlanService {

    void findPlanByLikeCount();

//    PlanPreviewResponse createPlanPreview(PlanPreviewRequest planPreviewRequest);

    CreatePlanResponseDto CreatePlanWithPlaces(Integer userId, CreatePlanRequestDto request);

    PlanDetailDto getPlanDetail(Integer planId);

    PlanCopyResponseDto copyPlan(Integer planId, Integer userId);

    PopularPlanResponseDto getPopularPlans(Double lat, Double lng, Integer limit, Integer page);

    PopularPlanResponseDto getNationwidePopularPlans(Integer limit, Integer page);

    Integer updatePlan(Integer userId, Integer planId, UpdatePlanRequestDto request);

    void deletePlan(Integer userId, Integer planId);
}
