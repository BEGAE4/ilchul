package com.begae.backend.plan.repository;

import com.begae.backend.plan.domain.ScrappedPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ScrappedPlanRepository extends JpaRepository<ScrappedPlan, Integer> {
    Integer countByPlan_PlanIdIn(List<Integer> planIds);

    Integer countByUser_UserId(int userId);

    Optional<ScrappedPlan> findByUser_UserIdAndPlan_PlanId(Integer userId, Integer planId);

    @Query("select sp.plan.planId from ScrappedPlan sp where sp.user.userId = :userId and sp.scrappedStatus = 1")
    List<Integer> findPlanIdsByUserId(Integer userId);
}
