package com.begae.backend.user.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.enums.ScrappedStatus;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.repository.ScrappedPlanRepository;
import com.begae.backend.user.common.UserStatus;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.dto.PublicUserProfileSummaryResponseDto;
import com.begae.backend.user.dto.UserPlansResponse;
import com.begae.backend.user.dto.UserProfileResponseDto;
import com.begae.backend.user.exception.UserErrorCode;
import com.begae.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final ScrappedPlanRepository scrappedPlanRepository;

    @Transactional
    @Override
    public UserProfileResponseDto findUserProfile(Integer userId) {
        User user = getActiveUserOrThrow(userId);
        return UserProfileResponseDto.from(user);
    }

    @Transactional
    @Override
    public PublicUserProfileSummaryResponseDto findUserProfileSummary(Integer userId) {
        User user = getActiveUserOrThrow(userId);

        Integer publicPlanCount = planRepository.countByUserUserIdAndIsPlanVisibleTrue(user.getUserId());
        Integer verifyPlanCount = planRepository.countByUserUserIdAndIsVerifiedTrue(user.getUserId());
        Integer scrappedByOthersCount =
                scrappedPlanRepository.countByPlan_User_UserIdAndScrappedStatus(user.getUserId(), ScrappedStatus.Y);

        return PublicUserProfileSummaryResponseDto.of(publicPlanCount, verifyPlanCount, scrappedByOthersCount);
    }

    @Transactional
    @Override
    public UserPlansResponse findUserPlans(Integer userId) {
        getActiveUserOrThrow(userId);

        List<Plan> plans = planRepository.findVisibleByUserUserId(userId);
        return UserPlansResponse.from(plans);
    }

    private User getActiveUserOrThrow(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        if (user.getUserStatus() == UserStatus.STATUS_UNAVAILABLE) {
            throw new CustomException(UserErrorCode.USER_WITHDRAWN);
        }

        return user;
    }
}
