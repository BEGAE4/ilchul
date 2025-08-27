package com.begae.backend.plan.service;

import com.begae.backend.plan.repository.PlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PlanServiceImpl implements PlanService{

    private final PlanRepository planRepository;

    @Override
    public void findPlanByLikeCount() {

    }
}
