package com.begae.backend.user.service;

import com.begae.backend.user.dto.MyPlansResponse;
import com.begae.backend.user.dto.UpdateUserProfileRequest;
import com.begae.backend.user.dto.UserProfileResponseDto;
import com.begae.backend.user.dto.UserProfileSummaryResponseDto;

public interface MyPageService {

    UserProfileResponseDto updateUserProfile(UpdateUserProfileRequest updateUserProfileRequest);

    MyPlansResponse findMyPlans();

    Boolean updateMyPlanVisibility(Integer planId);

    UserProfileResponseDto findMypageProfile(Integer userId);

    UserProfileSummaryResponseDto findMyPageSummary(Integer userId);
}
