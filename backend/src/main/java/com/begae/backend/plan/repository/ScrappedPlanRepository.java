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

    // 남의 플랜은 공개 목록과 같은 기준(공개 + 블라인드 아님)을 만족할 때만 저장한 플랜으로 보여준다.
    @Query("""
            select sp.plan.planId from ScrappedPlan sp
            where sp.user.userId = :userId and sp.scrappedStatus = Y
              and (sp.plan.user.userId = :userId or (sp.plan.isPlanVisible = true and sp.plan.isBlinded = false))
            """)
    List<Integer> findPlanIdsByUserId(Integer userId);

    @Query("""
            select distinct sp from ScrappedPlan sp
            join fetch sp.plan p
            left join fetch p.planPlaces pp
            left join fetch pp.place
            where sp.user.userId = :userId and sp.scrappedStatus = Y
              and (p.user.userId = :userId or (p.isPlanVisible = true and p.isBlinded = false))
            order by sp.scrappedAt desc
            """)
    List<ScrappedPlan> findVisibleScrapsByUserId(Integer userId);

    Integer countByPlan_User_UserIdAndScrappedStatus(Integer userId, ScrappedStatus status);

    @Query("""
            select count(sp) from ScrappedPlan sp
            where sp.user.userId = :userId and sp.scrappedStatus = Y
              and (sp.plan.user.userId = :userId or (sp.plan.isPlanVisible = true and sp.plan.isBlinded = false))
            """)
    Integer countVisibleScrappedPlans(Integer userId);
}
