package com.begae.backend.plan_place.service;

import com.begae.backend.plan_place.dto.CalculateDurationRequestDto;
import com.begae.backend.plan_place.dto.CalculateDurationResponseDto;

public interface PlanPlaceService {
    public CalculateDurationResponseDto calculateDuration(CalculateDurationRequestDto request);
}
