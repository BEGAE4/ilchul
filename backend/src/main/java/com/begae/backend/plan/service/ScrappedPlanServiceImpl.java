package com.begae.backend.plan.service;

import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.domain.ScrappedPlan;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.repository.ScrappedPlanRepository;
import com.begae.backend.plan_place.domain.PlanPlace;
import com.begae.backend.plan_place.domain.PlanPlaceImage;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.exception.UserNotFoundException;
import com.begae.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class ScrappedPlanServiceImpl implements ScrappedPlanService {

    private final ScrappedPlanRepository scrappedPlanRepository;
    private final PlanRepository planRepository;
    private final UserRepository userRepository;


    @Override
    @Transactional
    public Integer createPlanScrapped(Integer userId, Integer planId) {
        // plan 찾아오기
        Plan originPlan = planRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("PLAN 찾을 수 없습니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        // 기존 플랜 scrapped count ++
        originPlan.increaseScrappedCount();

        // 새로운 플랜 만들기
        Plan newPlan = Plan.builder()
                .planTitle(originPlan.getPlanTitle())
                .requiredTime(originPlan.getRequiredTime())
                .totalDistance(originPlan.getTotalDistance())
                .departurePoint(originPlan.getDeparturePoint())
                .user(user)
                .likeCount(0)
                .scrapCount(0)
                .isVerified(false)
                .isPlanVisible(false)
                .planPlaces(new ArrayList<>())
                .build();

        // 새로운 플랜 장소 만들기
        for(PlanPlace planPlace : originPlan.getPlanPlaces()) {
            PlanPlace newPlanPlace = PlanPlace.builder()
                    .place(planPlace.getPlace())
                    .plan(newPlan)
                    .orderIndex(planPlace.getOrderIndex())
                    .travelTime(planPlace.getTravelTime())
                    .stayTime(planPlace.getStayTime())
                    .snapshotAddressName(planPlace.getSnapshotAddressName())
                    .snapshotRoadAddressName(planPlace.getSnapshotRoadAddressName())
                    .snapshotCategoryName(planPlace.getSnapshotCategoryName())
                    .snapshotPlaceName(planPlace.getSnapshotPlaceName())
                    .snapshotX(planPlace.getSnapshotX())
                    .snapshotY(planPlace.getSnapshotY())
                    .isStamped(false)
                    .planPlaceImages(new ArrayList<>())
                    .build();

            for (PlanPlaceImage planPlaceImage : planPlace.getPlanPlaceImages()) {
                PlanPlaceImage newPlanPlaceImage = PlanPlaceImage.builder()
                        .imageUrl(planPlaceImage.getImageUrl())
                        .planPlace(newPlanPlace)
                        .build();
                newPlanPlace.getPlanPlaceImages().add(newPlanPlaceImage);
            }

            newPlan.getPlanPlaces().add(newPlanPlace);
        }

        planRepository.save(newPlan);

        // 새로운 plan scrapped 만들기
        ScrappedPlan newScrapped = ScrappedPlan.builder()
                .newPlan(newPlan)
                .originPlan(originPlan)
                .user(user)
                .scrappedAt(LocalDateTime.now())
                .build();

        scrappedPlanRepository.save(newScrapped);

        return newPlan.getPlanId();
    }
}
