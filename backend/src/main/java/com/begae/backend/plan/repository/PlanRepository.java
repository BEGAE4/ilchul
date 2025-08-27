package com.begae.backend.plan.repository;

import com.begae.backend.plan.domain.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PlanRepository extends JpaRepository<Plan, Integer> {

    @Query()
    List<Plan> findByUserUserId(Integer userId);
}
