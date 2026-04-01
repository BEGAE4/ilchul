package com.begae.backend.plan.repository;

import com.begae.backend.plan.domain.ScrappedPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScrappedPlanRepository extends JpaRepository<ScrappedPlan, Integer> {
    Integer countByOriginPlan_PlanIdIn(List<Integer> planIds);

    Integer countByUser_UserId(int userId);
}
