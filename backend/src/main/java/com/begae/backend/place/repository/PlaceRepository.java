package com.begae.backend.place.repository;

import com.begae.backend.place.domain.Place;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Integer> {
    Optional<Place> findPlaceBySourceAndSourceId(String source, String sourceId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Place p WHERE p.placeId = :placeId")
    Optional<Place> findByIdWithLock(@Param("placeId") Integer placeId);

    // 좋아요 수 기준 인기 장소 조회 (동률 시 place_id ASC 로 안정 정렬)
    @Query(value = """
            SELECT pl.place_id
            FROM place pl
            JOIN plan_place pp ON pp.place_id = pl.place_id
            JOIN plan p ON p.plan_id = pp.plan_id
            WHERE p.is_plan_visible = true
              AND pl.x IS NOT NULL
              AND pl.y IS NOT NULL
              AND (6371 * acos(LEAST(1.0,
                    cos(radians(:lat)) * cos(radians(pl.y))
                    * cos(radians(pl.x) - radians(:lng))
                    + sin(radians(:lat)) * sin(radians(pl.y))
                  ))) <= :radiusKm
            GROUP BY pl.place_id
            ORDER BY pl.like_count DESC, pl.place_id ASC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<Integer> findPopularPlaceIds(
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radiusKm") double radiusKm,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    @Query(value = """
            SELECT COUNT(DISTINCT pl.place_id)
            FROM place pl
            JOIN plan_place pp ON pp.place_id = pl.place_id
            JOIN plan p ON p.plan_id = pp.plan_id
            WHERE p.is_plan_visible = true
              AND pl.x IS NOT NULL
              AND pl.y IS NOT NULL
              AND (6371 * acos(LEAST(1.0,
                    cos(radians(:lat)) * cos(radians(pl.y))
                    * cos(radians(pl.x) - radians(:lng))
                    + sin(radians(:lat)) * sin(radians(pl.y))
                  ))) <= :radiusKm
            """, nativeQuery = true)
    int countPopularPlaces(
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radiusKm") double radiusKm
    );

    List<Place> findByPlaceIdIn(List<Integer> placeIds);

    // 좋아요 수 기준 전국 인기 장소 조회 (동률 시 place_id ASC 로 안정 정렬)
    @Query(value = """
            SELECT pl.place_id
            FROM place pl
            JOIN plan_place pp ON pp.place_id = pl.place_id
            JOIN plan p ON p.plan_id = pp.plan_id
            WHERE p.is_plan_visible = true
            GROUP BY pl.place_id
            ORDER BY pl.like_count DESC, pl.place_id ASC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<Integer> findNationwidePopularPlaceIds(
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    @Query(value = """
            SELECT COUNT(DISTINCT pl.place_id)
            FROM place pl
            JOIN plan_place pp ON pp.place_id = pl.place_id
            JOIN plan p ON p.plan_id = pp.plan_id
            WHERE p.is_plan_visible = true
            """, nativeQuery = true)
    int countNationwidePopularPlaces();
}
