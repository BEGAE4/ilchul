package com.begae.backend.plan_place.repository;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.plan_place.domain.PlanPlaceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanPlaceImageRepository extends JpaRepository<PlanPlaceImage, Integer> {

    // 예전 플랜 복제는 스탬프 사진 행을 같은 image_key 로 복사했으므로 파일을 지우기 전에 다른 참조를 확인한다.
    boolean existsByImageKeyAndPlanPlaceNot(String imageKey, PlanPlace planPlace);

    boolean existsByImageKeyAndPlanPlace_PlanNot(String imageKey, Plan plan);
}
