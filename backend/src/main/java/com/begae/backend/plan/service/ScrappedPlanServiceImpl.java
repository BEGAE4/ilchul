package com.begae.backend.plan.service;

import com.begae.backend.place.domain.Place;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.domain.ScrappedPlan;
import com.begae.backend.plan.dto.ScrappedPlanResponseDto;
import com.begae.backend.plan.enums.ScrappedStatus;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.repository.ScrappedPlanRepository;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.exception.UserNotFoundException;
import com.begae.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
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
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("PLAN 찾을 수 없습니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

//        // 새로운 플랜 만들기
//        Plan newPlan = Plan.builder()
//                .planTitle(originPlan.getPlanTitle())
//                .requiredTime(originPlan.getRequiredTime())
//                .totalDistance(originPlan.getTotalDistance())
//                .departurePoint(originPlan.getDeparturePoint())
//                .user(user)
//                .likeCount(0)
//                .scrapCount(0)
//                .isVerified(false)
//                .isPlanVisible(false)
//                .planPlaces(new ArrayList<>())
//                .build();
//
//        // 새로운 플랜 장소 만들기
//        for(PlanPlace planPlace : originPlan.getPlanPlaces()) {
//            PlanPlace newPlanPlace = PlanPlace.builder()
//                    .place(planPlace.getPlace())
//                    .plan(newPlan)
//                    .orderIndex(planPlace.getOrderIndex())
//                    .travelTime(planPlace.getTravelTime())
//                    .stayTime(planPlace.getStayTime())
//                    .snapshotAddressName(planPlace.getSnapshotAddressName())
//                    .snapshotRoadAddressName(planPlace.getSnapshotRoadAddressName())
//                    .snapshotCategoryName(planPlace.getSnapshotCategoryName())
//                    .snapshotPlaceName(planPlace.getSnapshotPlaceName())
//                    .snapshotX(planPlace.getSnapshotX())
//                    .snapshotY(planPlace.getSnapshotY())
//                    .isStamped(false)
//                    .planPlaceImages(new ArrayList<>())
//                    .build();
//
//            for (PlanPlaceImage planPlaceImage : planPlace.getPlanPlaceImages()) {
//                PlanPlaceImage newPlanPlaceImage = PlanPlaceImage.builder()
//                        .imageUrl(planPlaceImage.getImageUrl())
//                        .planPlace(newPlanPlace)
//                        .build();
//                newPlanPlace.getPlanPlaceImages().add(newPlanPlaceImage);
//            }
//
//            newPlan.getPlanPlaces().add(newPlanPlace);
//        }
//
//        planRepository.save(newPlan);

        Optional<ScrappedPlan> optionalScrappedPlan = scrappedPlanRepository
                .findByUser_UserIdAndPlan_PlanId(user.getUserId(), plan.getPlanId());
        if(optionalScrappedPlan.isPresent()) {
            ScrappedPlan scrappedPlan = optionalScrappedPlan.get();
            if(scrappedPlan.getScrappedStatus().equals(ScrappedStatus.Y)) {
                scrappedPlan.updateScrappedStatus(ScrappedStatus.N);
                plan.decreaseScrappedCount();
            } else {
                scrappedPlan.updateScrappedStatus(ScrappedStatus.Y);
                plan.increaseScrappedCount();
            }
            scrappedPlanRepository.save(scrappedPlan);
        } else {
            ScrappedPlan newScrappedPlan = ScrappedPlan.builder()
                    .plan(plan)
                    .user(user)
                    .scrappedAt(LocalDateTime.now())
                    .scrappedStatus(ScrappedStatus.Y)
                    .build();
            plan.increaseScrappedCount();
            scrappedPlanRepository.save(newScrappedPlan);
        }

        return plan.getPlanId();
    }

    @Override
    @Transactional(readOnly = true)
    public ScrappedPlanResponseDto findUserScrappedPlan(Integer userId) {
        List<Integer> planIds = scrappedPlanRepository.findPlanIdsByUserId(userId);

        List<Plan> plans = planRepository.findByPlanIdIn(planIds);

        List<ScrappedPlanResponseDto.ScrappedPlanSummary> scrappedPlanSummaries = plans.stream().map(plan -> {
            List<String> images = plan.getPlanPlaces().stream()
                    .map(planPlace -> {
                        Place place = planPlace.getPlace();
                        return place.getPlaceImageUrl();
                    })
                    .filter(url -> url != null && !url.isBlank())
                    .toList();

            return ScrappedPlanResponseDto.ScrappedPlanSummary.builder()
                    .planId(plan.getPlanId())
                    .planTitle(plan.getPlanTitle())
                    .isPlanVisible(plan.getIsPlanVisible())
                    .tripStartDate(plan.getTripStartDate())
                    .tripEndDate(plan.getTripEndDate())
                    .requiredTime(plan.getRequiredTime())
                    .createAt(plan.getCreateAt())
                    .planImages(images)
                    .build();
        }).toList();

        log.info("plans : {}", scrappedPlanSummaries);

        return ScrappedPlanResponseDto.builder()
                .scrappedPlans(scrappedPlanSummaries)
                .build();
    }

}
