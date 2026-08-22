package com.begae.backend.place.repository;

import com.begae.backend.place.domain.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PlaceAutocompleteRepository extends JpaRepository<Place, Integer> {

    @Query(value = """
            SELECT
                pl.category_name AS categoryName,
                SUM(CASE WHEN p.plan_id IS NOT NULL THEN 1 ELSE 0 END) AS score
            FROM place pl
            LEFT JOIN plan_place pp ON pp.place_id = pl.place_id
            LEFT JOIN plan p ON p.plan_id = pp.plan_id
                              AND p.is_plan_visible = true
            WHERE pl.category_name IS NOT NULL
              AND TRIM(pl.category_name) <> ''
              AND pl.category_name LIKE CONCAT('%', :prefix, '%')
            GROUP BY pl.category_name
            ORDER BY score DESC, pl.category_name ASC
            LIMIT :limit
            """, nativeQuery = true)
    List<CategoryAutocompleteProjection> findCategoryAutocompleteCandidates(
            @Param("prefix") String prefix,
            @Param("limit") int limit
    );

    @Query(value = """
            SELECT
                pl.place_id AS placeId,
                pl.place_name AS keyword,
                SUM(CASE WHEN p.plan_id IS NOT NULL THEN 1 ELSE 0 END) AS score
            FROM place pl
            LEFT JOIN plan_place pp ON pp.place_id = pl.place_id
            LEFT JOIN plan p ON p.plan_id = pp.plan_id
                              AND p.is_plan_visible = true
            WHERE pl.place_name IS NOT NULL
              AND TRIM(pl.place_name) <> ''
              AND pl.place_name LIKE CONCAT(:prefix, '%')
            GROUP BY pl.place_id, pl.place_name
            ORDER BY score DESC, pl.place_name ASC
            LIMIT :limit
            """, nativeQuery = true)
    List<PlaceAutocompleteProjection> findPlaceAutocompleteCandidates(
            @Param("prefix") String prefix,
            @Param("limit") int limit
    );

    interface CategoryAutocompleteProjection {
        String getCategoryName();

        Number getScore();
    }

    interface PlaceAutocompleteProjection {
        Integer getPlaceId();

        String getKeyword();

        Number getScore();
    }
}
