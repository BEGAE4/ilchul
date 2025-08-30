package com.begae.backend.user.service;

import com.begae.backend.user.dto.MyPlansResponse;
import com.begae.backend.user.dto.UpdateUserNicknameRequest;

public interface MyPageService {

    Boolean updateUserNickname(UpdateUserNicknameRequest updateUserNicknameRequest);

    MyPlansResponse findMyPlans();

    Boolean updateMyPlanVisibility(Integer planId);
}
