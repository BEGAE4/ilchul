package com.begae.backend.plan.service;

import com.begae.backend.plan.dto.CreatePlanRequestDto;

public interface PlanService {

    void findPlanByLikeCount();

    void createPlanWithPlaces(String userName, CreatePlanRequestDto createPlanRequestDto);
}
