package com.begae.backend.plan.repository;

import com.begae.backend.plan.domain.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlanRepository extends JpaRepository<Plan, Integer> {
    List<Plan> findByUserUserId(Integer userId);
}
