package com.begae.backend.user.controller;

import com.begae.backend.user.dto.MyPlansResponse;
import com.begae.backend.user.dto.UpdateUserProfileRequest;
import com.begae.backend.user.dto.UserProfileResponseDto;
import com.begae.backend.user.dto.UserProfileSummaryResponseDto;
import com.begae.backend.user.service.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;

    @PatchMapping("/profile")
    public ResponseEntity<UserProfileResponseDto> setUserProfile(@RequestBody UpdateUserProfileRequest updateUserProfileRequest) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(myPageService.updateUserProfile(updateUserProfileRequest));
    }

    @GetMapping("plans")
    public ResponseEntity<MyPlansResponse> getMyPlans() {
        MyPlansResponse myPlansResponse = myPageService.findMyPlans();
        if(myPlansResponse.getPlans().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(myPlansResponse);
    }

    @PostMapping("/plan/visibility/{planId}")
    public ResponseEntity<Void> setUserMyPlanVisibility(@PathVariable(name = "planId") Integer planId) {
        if(!myPageService.updateMyPlanVisibility(planId)) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();
        }
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponseDto> getMypageProfile() {
        Integer userId = 1;
        return ResponseEntity.status(HttpStatus.OK).body(myPageService.findMypageProfile(userId));
    }

    @GetMapping("/summary")
    public ResponseEntity<UserProfileSummaryResponseDto> getMyPageSummary() {
        Integer userId = 1;
        return ResponseEntity.status(HttpStatus.OK).body(myPageService.findMyPageSummary(userId));
    }
}
