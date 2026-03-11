package com.begae.backend.plan_place.service;

import com.begae.backend.plan_place.dto.CreatePlanPreviewRequestDto;
import com.begae.backend.plan_place.dto.CreatePlanPreviewResponseDto;

public interface PlanPlaceService {
    public CreatePlanPreviewResponseDto createPlanPreview(CreatePlanPreviewRequestDto request);
}
