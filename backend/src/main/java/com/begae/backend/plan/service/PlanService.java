package com.begae.backend.plan.service;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.dto.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PlanService {

    void findPlanByLikeCount();

//    PlanPreviewResponse createPlanPreview(PlanPreviewRequest planPreviewRequest);

    CreatePlanResponseDto CreatePlanWithPlaces(Integer userId, CreatePlanRequestDto request);

    PlanDetailDto getPlanDetail(Integer planId);

    PlanCopyResponseDto copyPlan(Integer planId, Integer userId);

    PopularPlanResponseDto getPopularPlans(Double lat, Double lng, Integer limit, Integer page);

    PopularPlanResponseDto getNationwidePopularPlans(Integer limit, Integer page);

    UpdatePlanResponseDto updatePlan(Integer userId, Integer planId, UpdatePlanRequestDto request);

    void deletePlan(Integer userId, Integer planId);

    PlanDetailDto uploadImages(Integer userId, Integer planId, List<MultipartFile> images);

    PlanDetailDto deleteImages(Integer userId, Integer planId, List<Integer> imageIds);

    void validatePlanOwner(Plan plan, Integer userId);
}
