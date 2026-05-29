package com.begae.backend.user.service;

import com.begae.backend.user.dto.MyPlansResponse;
import com.begae.backend.user.dto.UpdateUserProfileRequest;
import com.begae.backend.user.dto.UserProfileResponseDto;
import com.begae.backend.user.dto.UserProfileSummaryResponseDto;

public interface MyPageService {

    UserProfileResponseDto updateUserProfile(UpdateUserProfileRequest updateUserProfileRequest, Integer userId);

    MyPlansResponse findMyPlans(Integer userId);

    Boolean updateMyPlanVisibility(Integer planId, Integer userId);

    UserProfileResponseDto findMypageProfile(Integer userId);

    UserProfileSummaryResponseDto findMyPageSummary(Integer userId);
}
