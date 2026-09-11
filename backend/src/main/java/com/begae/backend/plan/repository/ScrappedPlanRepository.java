package com.begae.backend.plan.repository;

import com.begae.backend.plan.domain.ScrappedPlan;
import com.begae.backend.plan.enums.ScrappedStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ScrappedPlanRepository extends JpaRepository<ScrappedPlan, Integer> {
    Integer countByPlan_PlanIdIn(List<Integer> planIds);

    Integer countByUser_UserId(int userId);

    Integer countByPlan_User_UserId(Integer userId);

    Optional<ScrappedPlan> findByUser_UserIdAndPlan_PlanId(Integer userId, Integer planId);

    @Query("select sp.plan.planId from ScrappedPlan sp where sp.user.userId = :userId and sp.scrappedStatus = Y")
    List<Integer> findPlanIdsByUserId(Integer userId);

    Integer countByUser_UserIdAndScrappedStatus(int userId, ScrappedStatus status);

    Integer countByPlan_User_UserIdAndScrappedStatus(Integer userId, ScrappedStatus status);
}
