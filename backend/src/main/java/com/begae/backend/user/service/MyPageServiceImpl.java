package com.begae.backend.user.service;

import com.begae.backend.place.domain.Place;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.dto.MyPlansResponse;
import com.begae.backend.user.dto.UpdateUserNicknameRequest;
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

    @Transactional
    @Override
    public Boolean updateUserNickname(UpdateUserNicknameRequest updateUserNicknameRequest) {
        Integer userId = 1;
        User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
        user.updateUserNickname(updateUserNicknameRequest.getNewUserNickname());
        User newNicknameUser = userRepository.save(user);
        return newNicknameUser.getUserNickname().equals(updateUserNicknameRequest.getNewUserNickname());
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
                            plan.getTripDate(),
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
}
