package com.begae.backend.plan.repository;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.dto.PlanDetailFlatDto;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


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
        pl.totalDistance,
        pl.likeCount,
        pl.scrapCount,
        pl.user.userId,
        pl.user.userNickname,
        pl.user.userImg,
        pli.imageUrl,
        ppl.planPlaceId,
        ppl.place.placeId,
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
    left join pl.planImages pli
    where pl.planId = :planId
    order by ppl.orderIndex
""")
    List<PlanDetailFlatDto> findPlanDetailFlat(@Param("planId") Integer planId);

    List<Plan> findByPlanIdIn(List<Integer> planIds);

    @Query(value = """
            SELECT p.plan_id
            FROM plan p
            JOIN plan_place pp ON pp.plan_id = p.plan_id
            WHERE p.is_plan_visible = true
              AND p.is_blinded = false
              AND pp.snapshot_x IS NOT NULL
              AND pp.snapshot_y IS NOT NULL
              AND (6371 * acos(LEAST(1.0,
                    cos(radians(:lat)) * cos(radians(pp.snapshot_y))
                    * cos(radians(pp.snapshot_x) - radians(:lng))
                    + sin(radians(:lat)) * sin(radians(pp.snapshot_y))
                  ))) <= :radiusKm
            GROUP BY p.plan_id
            ORDER BY (MAX(p.like_count) + MAX(p.scrap_count)) DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<Integer> findPopularPlanIds(
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radiusKm") double radiusKm,
            @Param("limit") int limit,
            @Param("offset") int offset
            );

    @Query(value = """
            SELECT COUNT(DISTINCT p.plan_id)
            FROM plan p
            JOIN plan_place pp ON pp.plan_id = p.plan_id
            WHERE p.is_plan_visible = true
              AND p.is_blinded = false
              AND pp.snapshot_x IS NOT NULL
              AND pp.snapshot_y IS NOT NULL
              AND (6371 * acos(LEAST(1.0,
                    cos(radians(:lat)) * cos(radians(pp.snapshot_y))
                    * cos(radians(pp.snapshot_x) - radians(:lng))
                    + sin(radians(:lat)) * sin(radians(pp.snapshot_y))
                  ))) <= :radiusKm
            """, nativeQuery = true)
    int countPopularPlans(
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radiusKm") double radiusKm
    );

    @Query(value = """
            SELECT plan_id
            FROM plan
            WHERE is_plan_visible = true
              AND is_blinded = false
            ORDER BY (like_count + scrap_count) DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<Integer> findNationwidePopularPlanIds(
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    @Query(value = """
            SELECT COUNT(*)
            FROM plan
            WHERE is_plan_visible = true
              AND is_blinded = false
            """, nativeQuery = true)
    int countNationwidePopularPlans();

    @Query("""
    select p
    from Plan p
    left join fetch p.planPlaces
    where p.planId = :planId
    and p.user.userId = :userId
    """)
    Optional<Plan> findByPlanIdAndUserId(@Param("planId") Integer planId,
                                         @Param("userId") Integer userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Plan p WHERE p.planId = :planId")
    Optional<Plan> findByIdWithLock(@Param("planId") Integer planId);
}