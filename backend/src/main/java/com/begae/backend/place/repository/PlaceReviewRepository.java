package com.begae.backend.place.repository;

import com.begae.backend.place.domain.PlaceReview;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaceReviewRepository extends JpaRepository<PlaceReview, Integer> {

    @Query("SELECT pr FROM PlaceReview pr JOIN FETCH pr.user WHERE pr.place.placeId = :placeId AND (:lastReviewId IS NULL OR pr.reviewId < :lastReviewId) ORDER BY pr.reviewId DESC")
    List<PlaceReview> findReviewsNoOffset(@Param("placeId") Integer placeId, @Param("lastReviewId") Integer lastReviewId, Pageable pageable);
}
