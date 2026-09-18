package com.begae.backend.user.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.GlobalErrorCode;
import com.begae.backend.plan.domain.Plan;
import com.begae.backend.plan.enums.ScrappedStatus;
import com.begae.backend.plan.exception.PlanErrorCode;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.repository.ScrappedPlanRepository;
import com.begae.backend.storage.dto.StoredImage;
import com.begae.backend.storage.service.ImageFileCleaner;
import com.begae.backend.storage.service.ImageStorageService;
import com.begae.backend.user.domain.User;
import com.begae.backend.user.dto.MyPlansResponse;
import com.begae.backend.user.dto.UpdateUserProfileRequest;
import com.begae.backend.user.dto.UserProfileResponseDto;
import com.begae.backend.user.dto.UserProfileSummaryResponseDto;
import com.begae.backend.user.exception.UserErrorCode;
import com.begae.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MyPageServiceImpl implements MyPageService {

    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final ScrappedPlanRepository scrappedPlanRepository;
    private final ImageStorageService imageStorageService;
    private final ImageFileCleaner imageFileCleaner;
    private final ProfileImageProcessor profileImageProcessor;

    @Transactional
    @Override
    public UserProfileResponseDto updateUserProfile(UpdateUserProfileRequest updateUserProfileRequest, Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new CustomException(UserErrorCode.USER_NOT_FOUND)
        );
        user.updateUserProfile(
                updateUserProfileRequest.getNewUserNickname(),
                updateUserProfileRequest.getNewUserIntro());
        return UserProfileResponseDto.from(user);
    }

    @Transactional
    @Override
    public MyPlansResponse findMyPlans(Integer userId) {
        List<Plan> plans = planRepository.findByUserUserId(userId);

        return MyPlansResponse.from(plans);
    }

    @Transactional
    @Override
    public Boolean updateMyPlanVisibility(Integer planId, Integer userId) {
        Plan plan = planRepository.findById(planId).orElseThrow(
                () -> new CustomException(PlanErrorCode.PLAN_NOT_FOUND));

        // 내 플랜이 아닐 경우 오류
        if (!plan.getUser().getUserId().equals(userId)) {
            throw new CustomException(GlobalErrorCode.HANDLE_ACCESS_DENIED);
        }

        Boolean prevVisibility = plan.getIsPlanVisible();
        plan.updateIsPlanVisibility();
        Boolean currVisibility = plan.getIsPlanVisible();
        return prevVisibility.equals(!currVisibility);
    }

    @Transactional
    @Override
    public UserProfileResponseDto findMypageProfile(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
        return new UserProfileResponseDto(
                user.getUserNickname(),
                user.getUserImg(),
                user.getUserIntro()
        );
    }

    @Override
    public UserProfileSummaryResponseDto findMyPageSummary(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));

        Integer publicPlanCount = planRepository.countByUserUserIdAndIsPlanVisibleTrue(user.getUserId());
        Integer verifyPlanCount = planRepository.countByUserUserIdAndIsVerifiedTrue(user.getUserId());
        Integer scrappedByOthersCount =
                scrappedPlanRepository.countByPlan_User_UserIdAndScrappedStatus(user.getUserId(), ScrappedStatus.Y);
        Integer savedCourseCount = scrappedPlanRepository.countVisibleScrappedPlans(user.getUserId());

        return UserProfileSummaryResponseDto
                .of(publicPlanCount, verifyPlanCount, scrappedByOthersCount, savedCourseCount);
    }

    @Transactional
    @Override
    public UserProfileResponseDto uploadProfileImage(MultipartFile image, Integer userId) {
        User user = findUser(userId);
        ProcessedProfileImage processed = profileImageProcessor.process(image);
        StoredImage stored = imageStorageService.uploadByUrl(
                processed.bytes(),
                processed.originalFilename(),
                processed.contentType(),
                "users/profile"
        );
        imageFileCleaner.deleteIfRolledBack(stored.imageKey());

        String previousImageKey = user.getUserImgKey();
        user.replaceProfileImage(stored.imageUrl(), stored.imageKey());
        if (StringUtils.hasText(previousImageKey)) {
            imageFileCleaner.deleteAfterCommit(List.of(previousImageKey));
        }
        return UserProfileResponseDto.from(user);
    }

    @Transactional
    @Override
    public UserProfileResponseDto deleteProfileImage(Integer userId) {
        User user = findUser(userId);
        String previousImageKey = user.getUserImgKey();
        user.removeProfileImage();
        if (StringUtils.hasText(previousImageKey)) {
            imageFileCleaner.deleteAfterCommit(List.of(previousImageKey));
        }
        return UserProfileResponseDto.from(user);
    }

    private User findUser(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(UserErrorCode.USER_NOT_FOUND));
    }
}
