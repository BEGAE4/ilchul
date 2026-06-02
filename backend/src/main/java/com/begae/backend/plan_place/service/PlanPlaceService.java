package com.begae.backend.plan_place.service;

import com.begae.backend.plan_place.dto.*;
import org.springframework.transaction.annotation.Transactional;

public interface PlanPlaceService {
    CreatePlanPreviewResponseDto createPlanPreview(CreatePlanPreviewRequestDto request);

    @Transactional(readOnly = true)
    UpdatePlanPreviewResponseDto updatePlanPreview(Integer userId, Integer planId, UpdatePlanPlaceRequestDto request);

    @Transactional
    UpdatePlanPlaceResponseDto updatePlanPlace(Integer userId, Integer planId, UpdatePlanPlaceRequestDto request);
}
