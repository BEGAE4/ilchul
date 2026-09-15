package com.begae.backend.user.controller;

import com.begae.backend.user.dto.PublicUserProfileSummaryResponseDto;
import com.begae.backend.user.dto.UserPlansResponse;
import com.begae.backend.user.dto.UserProfileResponseDto;
import com.begae.backend.user.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "유저프로필", description = "유저프로필 관련 API")
@Validated
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @Operation(summary = "다른 사용자 프로필 조회", description = "특정 사용자의 프로필 정보를 조회합니다.")
    @ApiResponse(responseCode = "200", description = "프로필 정보를 성공적으로 조회했습니다.")
    @ApiResponse(responseCode = "404", description = "회원을 찾을 수 없습니다.")
    @ApiResponse(responseCode = "410", description = "탈퇴한 사용자입니다.")
    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponseDto> getUserProfile(
            @Parameter(description = "사용자 ID", example = "1") @PathVariable @Positive Integer userId
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(userProfileService.findUserProfile(userId));
    }

    @Operation(summary = "다른 사용자 활동 요약 조회", description = "특정 사용자의 공개 활동 요약 정보를 조회합니다.")
    @ApiResponse(responseCode = "200", description = "요약 정보를 성공적으로 조회했습니다.")
    @ApiResponse(responseCode = "404", description = "회원을 찾을 수 없습니다.")
    @ApiResponse(responseCode = "410", description = "탈퇴한 사용자입니다.")
    @GetMapping("/{userId}/summary")
    public ResponseEntity<PublicUserProfileSummaryResponseDto> getUserProfileSummary(
            @Parameter(description = "사용자 ID", example = "1") @PathVariable @Positive Integer userId
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(userProfileService.findUserProfileSummary(userId));
    }

    @Operation(summary = "다른 사용자 플랜 목록 조회", description = "특정 사용자가 작성한 공개 플랜 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "플랜 목록을 성공적으로 조회했습니다.")
    @ApiResponse(responseCode = "204", description = "조회된 플랜이 없습니다.")
    @ApiResponse(responseCode = "404", description = "회원을 찾을 수 없습니다.")
    @ApiResponse(responseCode = "410", description = "탈퇴한 사용자입니다.")
    @GetMapping("/{userId}/plans")
    public ResponseEntity<UserPlansResponse> getUserPlans(
            @Parameter(description = "사용자 ID", example = "1") @PathVariable @Positive Integer userId
    ) {
        UserPlansResponse userPlansResponse = userProfileService.findUserPlans(userId);
        if (userPlansResponse.getPlans().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(userPlansResponse);
    }
}
