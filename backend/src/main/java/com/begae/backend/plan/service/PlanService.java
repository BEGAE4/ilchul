package com.begae.backend.plan.service;

import com.begae.backend.plan.dto.PlanCopyResponseDto;
import com.begae.backend.plan.dto.PlanDetailDto;
import com.begae.backend.plan.dto.PopularPlanResponseDto;

public interface PlanService {

    void findPlanByLikeCount();

//    PlanPreviewResponse createPlanPreview(PlanPreviewRequest planPreviewRequest);

    PlanDetailDto getPlanDetail(Integer planId);

    PlanCopyResponseDto copyPlan(Integer planId, Integer userId);

    PopularPlanResponseDto getPopularPlans(Double lat, Double lng, Integer limit, Integer page);

    PopularPlanResponseDto getNationwidePopularPlans(Integer limit, Integer page);
}
