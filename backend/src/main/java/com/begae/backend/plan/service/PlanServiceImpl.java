package com.begae.backend.plan.service;

import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.dto.CreatePlanRequestDto;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan_place.repository.PlanPlaceRepository;
import com.begae.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PlanServiceImpl implements PlanService {

    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final PlaceRepository placeRepository;
    private final PlanPlaceRepository planPlaceRepository;

    @Override
    public void findPlanByLikeCount() {

    }

    @Override
    public void createPlanWithPlaces(String userName, CreatePlanRequestDto createPlanRequestDto) {

    }
}
