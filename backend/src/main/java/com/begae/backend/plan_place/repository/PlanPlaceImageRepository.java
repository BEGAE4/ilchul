package com.begae.backend.plan_place.repository;

import com.begae.backend.plan_place.domain.PlanPlaceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanPlaceImageRepository extends JpaRepository<PlanPlaceImage, Integer> {
}
