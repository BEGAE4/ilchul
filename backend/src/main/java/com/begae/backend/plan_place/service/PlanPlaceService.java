package com.begae.backend.plan_place.service;

import com.begae.backend.plan_place.dto.CreatePlanPreviewRequestDto;
import com.begae.backend.plan_place.dto.CreatePlanPreviewResponseDto;

public interface PlanPlaceService {
    CreatePlanPreviewResponseDto createPlanPreview(CreatePlanPreviewRequestDto request);
}
