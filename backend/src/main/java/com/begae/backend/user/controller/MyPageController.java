package com.begae.backend.user.controller;

import com.begae.backend.plan.dto.ScrappedPlanResponseDto;
import com.begae.backend.plan.service.ScrappedPlanService;
import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.user.dto.MyPlansResponse;
import com.begae.backend.user.dto.UpdateUserProfileRequest;
import com.begae.backend.user.dto.UserProfileResponseDto;
import com.begae.backend.user.dto.UserProfileSummaryResponseDto;
import com.begae.backend.user.service.MyPageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;
    private final ScrappedPlanService scrappedPlanService;

    @PatchMapping("/profile")
    public ResponseEntity<UserProfileResponseDto> setUserProfile(
            @RequestBody @Valid UpdateUserProfileRequest updateUserProfileRequest,
            @AuthenticationPrincipal OauthUserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(myPageService.updateUserProfile(updateUserProfileRequest, userDetails.getUserId()));
    }

    @GetMapping("plans")
    public ResponseEntity<MyPlansResponse> getMyPlans(
            @AuthenticationPrincipal OauthUserDetails userDetails
    ) {
        MyPlansResponse myPlansResponse = myPageService.findMyPlans(userDetails.getUserId());
        if(myPlansResponse.getPlans().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(myPlansResponse);
    }

    @PostMapping("/plan/visibility/{planId}")
    public ResponseEntity<Void> setUserMyPlanVisibility(
                @PathVariable(name = "planId") @Positive Integer planId,
                @AuthenticationPrincipal OauthUserDetails userDetails
                ) {
        if(!myPageService.updateMyPlanVisibility(planId, userDetails.getUserId())) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();
        }
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponseDto> getMypageProfile(
                @AuthenticationPrincipal OauthUserDetails userDetails
                ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(myPageService.findMypageProfile(userDetails.getUserId()));
    }

    @GetMapping("/summary")
    public ResponseEntity<UserProfileSummaryResponseDto> getMyPageSummary(
                @AuthenticationPrincipal OauthUserDetails userDetails
                ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(myPageService.findMyPageSummary(userDetails.getUserId()));
    }

    @GetMapping("/scrapped")
    public ResponseEntity<ScrappedPlanResponseDto> getScrappedPlan(
                @AuthenticationPrincipal OauthUserDetails userDetails
                ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(scrappedPlanService.findUserScrappedPlan(userDetails.getUserId()));
    }
}
