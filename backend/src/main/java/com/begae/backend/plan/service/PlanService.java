package com.begae.backend.plan.service;

import com.begae.backend.plan.dto.PlanCopyResponseDto;
import com.begae.backend.plan.dto.PlanDetailDto;

public interface PlanService {

    void findPlanByLikeCount();

//    PlanPreviewResponse createPlanPreview(PlanPreviewRequest planPreviewRequest);

    PlanDetailDto getPlanDetail(Integer planId);

    PlanCopyResponseDto copyPlan(Integer planId, Integer userId);
}
