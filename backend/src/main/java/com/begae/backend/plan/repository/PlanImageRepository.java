package com.begae.backend.plan.repository;


import com.begae.backend.plan.domain.PlanImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlanImageRepository extends JpaRepository<PlanImage, Integer> {
    Optional<PlanImage> findByPlanImageIdAndPlan_PlanId(Integer planImageId, Integer planId);
}
