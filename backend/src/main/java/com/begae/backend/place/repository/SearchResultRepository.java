package com.begae.backend.place.repository;

import com.begae.backend.place.domain.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SearchResultRepository extends JpaRepository<Place, Integer> {

    @Query(value = """
            SELECT
                pl.place_id AS placeId,
                pl.place_name AS placeName,
                pl.address_name AS addressName,
                pl.road_address_name AS roadAddressName,
                pl.category_name AS categoryName,
                pl.place_image_url AS placeImageUrl,
                pl.x AS x,
                pl.y AS y,
                COALESCE(pl.like_count, 0) AS likeCount,
                COALESCE(pl.scrap_count, 0) AS scrapCount,
                COUNT(DISTINCT CASE
                    WHEN p.plan_id IS NOT NULL THEN p.plan_id
                    ELSE NULL
                END) AS includedPlanCount,
                CASE
                    WHEN LOWER(pl.place_name) = LOWER(:keyword) THEN 1
                    ELSE 0
                END AS exactMatched,
                CASE
                    WHEN LOWER(pl.place_name) LIKE LOWER(CONCAT(:keyword, '%')) THEN 1
                    ELSE 0
                END AS prefixMatched
            FROM place pl
            LEFT JOIN plan_place pp ON pp.place_id = pl.place_id
            LEFT JOIN plan p ON p.plan_id = pp.plan_id
                            AND p.is_plan_visible = true
                            AND (p.is_blinded = false OR p.is_blinded IS NULL)
            WHERE pl.place_name LIKE CONCAT('%', :keyword, '%')
               OR pl.category_name LIKE CONCAT('%', :keyword, '%')
               OR pl.address_name LIKE CONCAT('%', :keyword, '%')
               OR pl.road_address_name LIKE CONCAT('%', :keyword, '%')
            GROUP BY
                pl.place_id,
                pl.place_name,
                pl.address_name,
                pl.road_address_name,
                pl.category_name,
                pl.place_image_url,
                pl.x,
                pl.y,
                pl.like_count,
                pl.scrap_count
            ORDER BY
                exactMatched DESC,
                prefixMatched DESC,
                includedPlanCount DESC,
                COALESCE(pl.like_count, 0) DESC,
                COALESCE(pl.scrap_count, 0) DESC,
                pl.place_name ASC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<SearchPlaceProjection> searchPlaces(
            @Param("keyword") String keyword,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    @Query(value = """
            SELECT COUNT(DISTINCT pl.place_id)
            FROM place pl
            WHERE pl.place_name LIKE CONCAT('%', :keyword, '%')
               OR pl.category_name LIKE CONCAT('%', :keyword, '%')
               OR pl.address_name LIKE CONCAT('%', :keyword, '%')
               OR pl.road_address_name LIKE CONCAT('%', :keyword, '%')
            """, nativeQuery = true)
    Number countPlaces(@Param("keyword") String keyword);

    @Query(value = """
            SELECT
                p.plan_id AS planId,
                p.plan_title AS planTitle,
                p.plan_description AS planDescription,
                p.required_time AS requiredTime,
                p.total_distance AS totalDistance,
                COALESCE(p.like_count, 0) AS likeCount,
                COALESCE(p.scrap_count, 0) AS scrapCount,
                p.create_at AS createAt,
                (
                    SELECT pl2.place_image_url
                    FROM plan_place pp2
                    JOIN place pl2 ON pl2.place_id = pp2.place_id
                    WHERE pp2.plan_id = p.plan_id
                      AND pl2.place_image_url IS NOT NULL
                      AND TRIM(pl2.place_image_url) <> ''
                    ORDER BY pp2.order_index ASC
                    LIMIT 1
                ) AS thumbnailUrl,
                MAX(CASE
                    WHEN LOWER(pl.place_name) = LOWER(:keyword)
                      OR LOWER(pp.snapshot_place_name) = LOWER(:keyword)
                    THEN 1
                    ELSE 0
                END) AS matchedByExactPlace,
                MAX(CASE
                    WHEN pl.place_name LIKE CONCAT('%', :keyword, '%')
                      OR pp.snapshot_place_name LIKE CONCAT('%', :keyword, '%')
                    THEN 1
                    ELSE 0
                END) AS matchedByPlace
            FROM plan p
            LEFT JOIN plan_place pp ON pp.plan_id = p.plan_id
            LEFT JOIN place pl ON pl.place_id = pp.place_id
            WHERE p.is_plan_visible = true
              AND (p.is_blinded = false OR p.is_blinded IS NULL)
              AND (
                    p.plan_title LIKE CONCAT('%', :keyword, '%')
                 OR p.plan_description LIKE CONCAT('%', :keyword, '%')
                 OR pl.place_name LIKE CONCAT('%', :keyword, '%')
                 OR pp.snapshot_place_name LIKE CONCAT('%', :keyword, '%')
                 OR pl.category_name LIKE CONCAT('%', :keyword, '%')
                 OR pp.snapshot_category_name LIKE CONCAT('%', :keyword, '%')
                 OR pl.address_name LIKE CONCAT('%', :keyword, '%')
                 OR pp.snapshot_address_name LIKE CONCAT('%', :keyword, '%')
                 OR pl.road_address_name LIKE CONCAT('%', :keyword, '%')
                 OR pp.snapshot_road_address_name LIKE CONCAT('%', :keyword, '%')
              )
            GROUP BY
                p.plan_id,
                p.plan_title,
                p.plan_description,
                p.required_time,
                p.total_distance,
                p.like_count,
                p.scrap_count,
                p.create_at
            ORDER BY
                matchedByExactPlace DESC,
                matchedByPlace DESC,
                CASE
                    WHEN LOWER(p.plan_title) = LOWER(:keyword) THEN 1
                    ELSE 0
                END DESC,
                CASE
                    WHEN LOWER(p.plan_title) LIKE LOWER(CONCAT(:keyword, '%')) THEN 1
                    ELSE 0
                END DESC,
                COALESCE(p.like_count, 0) DESC,
                COALESCE(p.scrap_count, 0) DESC,
                p.create_at DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<SearchPlanProjection> searchPlans(
            @Param("keyword") String keyword,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    @Query(value = """
            SELECT COUNT(DISTINCT p.plan_id)
            FROM plan p
            LEFT JOIN plan_place pp ON pp.plan_id = p.plan_id
            LEFT JOIN place pl ON pl.place_id = pp.place_id
            WHERE p.is_plan_visible = true
              AND (p.is_blinded = false OR p.is_blinded IS NULL)
              AND (
                    p.plan_title LIKE CONCAT('%', :keyword, '%')
                 OR p.plan_description LIKE CONCAT('%', :keyword, '%')
                 OR pl.place_name LIKE CONCAT('%', :keyword, '%')
                 OR pp.snapshot_place_name LIKE CONCAT('%', :keyword, '%')
                 OR pl.category_name LIKE CONCAT('%', :keyword, '%')
                 OR pp.snapshot_category_name LIKE CONCAT('%', :keyword, '%')
                 OR pl.address_name LIKE CONCAT('%', :keyword, '%')
                 OR pp.snapshot_address_name LIKE CONCAT('%', :keyword, '%')
                 OR pl.road_address_name LIKE CONCAT('%', :keyword, '%')
                 OR pp.snapshot_road_address_name LIKE CONCAT('%', :keyword, '%')
              )
            """, nativeQuery = true)
    Number countPlans(@Param("keyword") String keyword);

    @Query(value = """
            SELECT
                pp.plan_id AS planId,
                pp.plan_place_id AS planPlaceId,
                pl.place_id AS placeId,
                COALESCE(pp.snapshot_place_name, pl.place_name) AS placeName,
                COALESCE(pp.snapshot_category_name, pl.category_name) AS categoryName,
                COALESCE(pp.snapshot_address_name, pl.address_name) AS addressName,
                COALESCE(pp.snapshot_road_address_name, pl.road_address_name) AS roadAddressName,
                pl.place_image_url AS placeImageUrl,
                pp.order_index AS orderIndex,
                CASE
                    WHEN COALESCE(pp.snapshot_place_name, pl.place_name) LIKE CONCAT('%', :keyword, '%')
                      OR COALESCE(pp.snapshot_category_name, pl.category_name) LIKE CONCAT('%', :keyword, '%')
                      OR COALESCE(pp.snapshot_address_name, pl.address_name) LIKE CONCAT('%', :keyword, '%')
                      OR COALESCE(pp.snapshot_road_address_name, pl.road_address_name) LIKE CONCAT('%', :keyword, '%')
                    THEN 1
                    ELSE 0
                END AS matched
            FROM plan_place pp
            JOIN place pl ON pl.place_id = pp.place_id
            WHERE pp.plan_id IN (:planIds)
            ORDER BY pp.plan_id ASC, pp.order_index ASC
            """, nativeQuery = true)
    List<SearchPlanPlaceProjection> findPlanPlacesByPlanIds(
            @Param("planIds") List<Integer> planIds,
            @Param("keyword") String keyword
    );

    interface SearchPlaceProjection {
        Integer getPlaceId();

        String getPlaceName();

        String getAddressName();

        String getRoadAddressName();

        String getCategoryName();

        String getPlaceImageUrl();

        Double getX();

        Double getY();

        Number getLikeCount();

        Number getScrapCount();

        Number getIncludedPlanCount();
    }

    interface SearchPlanProjection {
        Integer getPlanId();

        String getPlanTitle();

        String getPlanDescription();

        Number getRequiredTime();

        Number getTotalDistance();

        Number getLikeCount();

        Number getScrapCount();

        java.sql.Timestamp getCreateAt();

        String getThumbnailUrl();

        Number getMatchedByPlace();
    }

    interface SearchPlanPlaceProjection {
        Integer getPlanId();

        Integer getPlanPlaceId();

        Integer getPlaceId();

        String getPlaceName();

        String getCategoryName();

        String getAddressName();

        String getRoadAddressName();

        String getPlaceImageUrl();

        Number getOrderIndex();

        Number getMatched();
    }
}
