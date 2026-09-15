package com.begae.backend.user.service;

import com.begae.backend.user.dto.PublicUserProfileSummaryResponseDto;
import com.begae.backend.user.dto.UserPlansResponse;
import com.begae.backend.user.dto.UserProfileResponseDto;

public interface UserProfileService {

    UserProfileResponseDto findUserProfile(Integer userId);

    PublicUserProfileSummaryResponseDto findUserProfileSummary(Integer userId);

    UserPlansResponse findUserPlans(Integer userId);
}
