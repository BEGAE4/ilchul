package com.begae.backend.user.service;

import com.begae.backend.place.domain.Place;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.repository.ScrappedPlanRepository;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.dto.MyPlansResponse;
import com.begae.backend.user.dto.UpdateUserProfileRequest;
import com.begae.backend.user.dto.UserProfileResponseDto;
import com.begae.backend.user.dto.UserProfileSummaryResponseDto;
import com.begae.backend.user.exception.UserNotFoundException;
import com.begae.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MyPageServiceImpl implements MyPageService {

    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final ScrappedPlanRepository scrappedPlanRepository;

    @Transactional
    @Override
    public UserProfileResponseDto updateUserProfile(UpdateUserProfileRequest updateUserProfileRequest) {
        Integer userId = 1;
        User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
        user.updateUserProfile(
                updateUserProfileRequest.getNewUserNickname(),
                updateUserProfileRequest.getNewUserIntro(),
                updateUserProfileRequest.getNewUserProfileImg());
        User newNicknameUser = userRepository.save(user);
        return UserProfileResponseDto.from(user);
    }

    @Transactional
    @Override
    public MyPlansResponse findMyPlans() {
        Integer userId = 1;
        List<Plan> plans = planRepository.findByUserUserId(userId);
        List<MyPlansResponse.PlanSummary> summaries = plans.stream()
                .map(plan -> {
                    List<String> images = plan.getPlanPlaces().stream()
                            .map(planPlace -> {
                                Place place = planPlace.getPlace();
                                return place.getPlaceImageUrl();
                            })
                            .filter(url -> url != null && !url.isBlank())
                            .toList();

                    return new MyPlansResponse.PlanSummary(
                            plan.getPlanId(),
                            plan.getPlanTitle(),
                            plan.getCreateAt(),
                            plan.getTripStartDate(),
                            plan.getTripEndDate(),
                            plan.getIsPlanVisible(),
                            plan.getRequiredTime(),
                            images
                    );
                })
                .toList();

        return new MyPlansResponse(summaries);
    }

    @Transactional
    @Override
    public Boolean updateMyPlanVisibility(Integer planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("PLAN_NOT_FOUND"));
        Boolean prevVisibility = plan.getIsPlanVisible();
        plan.updateIsPlanVisibility();
        Boolean currVisibility = plan.getIsPlanVisible();
        return prevVisibility.equals(!currVisibility);
    }

    @Override
    public UserProfileResponseDto findMypageProfile(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);
        return new UserProfileResponseDto(
                user.getUserNickname(),
                user.getUserImg(),
                user.getUserIntro()
        );
    }

    @Override
    public UserProfileSummaryResponseDto findMyPageSummary(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);
        List<Plan> plans = planRepository.findByUserUserId(user.getUserId());
        List<Integer> planIds = plans.stream().map(Plan::getPlanId).toList();
        Integer publicPlanCount = plans.stream().filter(Plan::getIsPlanVisible).toList().size();
        Integer verifyPlanCount = plans.stream().filter(Plan::getIsVerified).toList().size();
        Integer scrappedByOthersCount = scrappedPlanRepository.countByOriginPlan_PlanIdIn(planIds);
        Integer savedCourseCount = scrappedPlanRepository.countByUser_UserId(user.getUserId());
        return UserProfileSummaryResponseDto
                .builder()
                .publicPlanCount(publicPlanCount)
                .verifyPlanCount(verifyPlanCount)
                .scrappedByOthersCount(scrappedByOthersCount)
                .savedCourseCount(savedCourseCount)
                .build();
    }
}
