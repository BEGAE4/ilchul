package com.begae.backend.plan_place.service;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan_place.repository.PlanPlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PlanPlaceServiceImpl implements PlanPlaceService {

    private final PlanPlaceRepository planPlaceRepository;
}
