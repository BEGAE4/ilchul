package com.begae.backend.plan.service;

import com.begae.backend.plan.dto.PlanDetailDto;
import com.begae.backend.plan.dto.PlanDetailFlatDto;
import com.begae.backend.plan.dto.PlanPreviewRequest;
import com.begae.backend.plan.dto.PlanPreviewResponse;

import java.util.List;

public interface PlanService {

    void findPlanByLikeCount();

    PlanPreviewResponse createPlanPreview(PlanPreviewRequest planPreviewRequest);

    PlanDetailDto getPlanDetail(Integer planId);
}
