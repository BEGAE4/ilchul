package com.begae.backend.user.controller;

import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.plan.dto.ScrappedPlanResponseDto;
import com.begae.backend.plan.service.ScrappedPlanService;
import com.begae.backend.user.dto.MyPlansResponse;
import com.begae.backend.user.dto.UpdateUserProfileRequest;
import com.begae.backend.user.dto.UserProfileResponseDto;
import com.begae.backend.user.dto.UserProfileSummaryResponseDto;
import com.begae.backend.user.service.MyPageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "마이페이지", description = "마이페이지 관련 API")
@Validated
@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;
    private final ScrappedPlanService scrappedPlanService;

    @Operation(summary = "회원 프로필 수정", description = "내 프로필 정보를 수정합니다.")
    @ApiResponse(responseCode = "202", description = "프로필이 성공적으로 수정되었습니다.")
    @PatchMapping("/profile")
    public ResponseEntity<UserProfileResponseDto> setUserProfile(
            @AuthenticationPrincipal OauthUserDetails userDetails,
            @RequestBody @Valid UpdateUserProfileRequest updateUserProfileRequest
    ) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(myPageService.updateUserProfile(updateUserProfileRequest, userDetails.getUserId()));
    }

    @Operation(summary = "내 플랜 목록 조회", description = "내가 작성한 플랜 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "내 플랜 목록을 성공적으로 조회했습니다.")
    @ApiResponse(responseCode = "204", description = "조회된 플랜이 없습니다.")
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

    @Operation(summary = "내 플랜 공개 여부 변경", description = "내가 작성한 특정 플랜의 공개 여부를 전환합니다.")
    @ApiResponse(responseCode = "200", description = "플랜 공개 여부가 성공적으로 변경되었습니다.")
    @ApiResponse(responseCode = "304", description = "플랜 공개 여부가 변경되지 않았습니다.")
    @PostMapping("/plan/visibility/{planId}")
    public ResponseEntity<Void> setUserMyPlanVisibility(
                @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails userDetails,
                @Parameter(description = "플랜 ID", example = "1") @PathVariable(name = "planId") @Positive Integer planId
                ) {
        if(!myPageService.updateMyPlanVisibility(planId, userDetails.getUserId())) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();
        }
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @Operation(summary = "마이페이지 프로필 조회", description = "마이페이지에 표시할 내 프로필 정보를 조회합니다.")
    @ApiResponse(responseCode = "200", description = "프로필 정보를 성공적으로 조회했습니다.")
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponseDto> getMypageProfile(
                @AuthenticationPrincipal OauthUserDetails userDetails
                ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(myPageService.findMypageProfile(userDetails.getUserId()));
    }

    @Operation(summary = "마이페이지 요약 정보 조회", description = "마이페이지에 표시할 내 활동 요약 정보를 조회합니다.")
    @ApiResponse(responseCode = "200", description = "요약 정보를 성공적으로 조회했습니다.")
    @GetMapping("/summary")
    public ResponseEntity<UserProfileSummaryResponseDto> getMyPageSummary(
                @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails userDetails
                ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(myPageService.findMyPageSummary(userDetails.getUserId()));
    }

    @Operation(summary = "스크랩한 플랜 목록 조회", description = "내가 스크랩한 플랜 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "스크랩한 플랜 목록을 성공적으로 조회했습니다.")
    @GetMapping("/scrapped")
    public ResponseEntity<ScrappedPlanResponseDto> getScrappedPlan(
                @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails userDetails
                ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(scrappedPlanService.findUserScrappedPlan(userDetails.getUserId()));
    }
}
