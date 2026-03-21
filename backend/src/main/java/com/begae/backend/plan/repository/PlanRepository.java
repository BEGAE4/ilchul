package com.begae.backend.plan.repository;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.dto.PlanDetailFlatDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface PlanRepository extends JpaRepository<Plan, Integer> {

    @Query("""
    select distinct p from Plan p
    left join fetch p.planPlaces
    where p.user.userId = :userId
    """
    )
    List<Plan> findByUserUserId(Integer userId);

    @Query("""
    select new com.begae.backend.plan.dto.PlanDetailFlatDto(
        pl.planId,
        pl.planTitle,
        pl.tripStartDate,
        pl.tripEndDate,
        pl.createAt,
        pl.isVerified,
        pl.isPlanVisible,
        pl.planDescription,
        pl.requiredTime,
        pl.totalBudget,
        pl.totalDistance,
        pl.likeCount,
        pl.scrapCount,
        ppl.planPlaceId,
        ppl.travelTime,
        ppl.stayTime,
        plc.placeImageUrl,
        plc.placeName,
        plc.addressName,
        plc.roadAddressName,
        plc.categoryName,
        ppl.orderIndex,
        ppl.isStamped
    )
    from Plan pl
    left join pl.planPlaces ppl
    left join ppl.place plc
    where pl.planId = :planId
    order by ppl.orderIndex
""")
    List<PlanDetailFlatDto> findPlanDetailFlat(@Param("planId") Integer planId);
}