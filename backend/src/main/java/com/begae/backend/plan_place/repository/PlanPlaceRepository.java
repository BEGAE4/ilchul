package com.begae.backend.plan_place.repository;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan_place.domain.PlanPlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanPlaceRepository extends JpaRepository<PlanPlace, Integer> {
    List<PlanPlace> findByPlanOrderByOrderIndexAsc(Plan plan);
}
