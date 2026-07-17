package com.begae.backend.plan.controller;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.GlobalErrorCode;
import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.plan.dto.*;
import com.begae.backend.plan.service.PlanService;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "플랜", description = "여행 플랜 관련 API")
@Validated
@RestController
@RequestMapping("api/plan")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

//    @PostMapping("/preview")
//    public ResponseEntity<PlanPreviewResponse> postPlanPreview(@RequestBody PlanPreviewRequest planPreviewRequest) {
//        return ResponseEntity.status(HttpStatus.OK).body(planService.createPlanPreview(planPreviewRequest));
//    }
//
    @Operation(summary = "플랜 상세 조회", description = "특정 플랜의 상세 정보를 조회합니다.")
    @ApiResponse(responseCode = "200", description = "플랜 상세 정보를 성공적으로 조회했습니다.")
    @GetMapping("/{planId}")
    public ResponseEntity<PlanDetailDto> getPlanDetail(
            @AuthenticationPrincipal OauthUserDetails userDetails,
            @Parameter(description = "플랜 ID", example = "1") @PathVariable Integer planId
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(planService.getPlanDetail(planId, userDetails.getUserId()));
    }

    @Operation(summary = "플랜 복제", description = "특정 플랜을 복제하여 내 플랜으로 새로 생성합니다.")
    @ApiResponse(responseCode = "201", description = "플랜이 성공적으로 복제되었습니다.")
    @PostMapping("/{planId}/clone")
    public ResponseEntity<PlanCopyResponseDto> copyPlan(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails userDetails,
            @Parameter(description = "복제할 원본 플랜 ID", example = "1") @PathVariable @Positive Integer planId,
            @Valid @RequestBody PlanCopyRequestDto planCopyRequestDto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(planService.copyPlan(planId, planCopyRequestDto, userDetails.getUserId()));
    }

    @Operation(summary = "내 주변 인기 플랜 조회", description = "위도/경도를 기준으로 내 주변의 인기 플랜 목록을 페이지 단위로 조회합니다.")
    @ApiResponse(responseCode = "200", description = "내 주변 인기 플랜 목록을 성공적으로 조회했습니다.")
    @GetMapping("/popular")
    public ResponseEntity<PopularPlanResponseDto> getPopularPlans(
            @Parameter(description = "위도", example = "37.5665") @RequestParam Double lat,
            @Parameter(description = "경도", example = "126.9780") @RequestParam Double lng,
            @Parameter(description = "페이지당 조회 개수", example = "5") @RequestParam(defaultValue = "5") Integer limit,
            @Parameter(description = "페이지 번호", example = "1") @RequestParam(defaultValue = "1") Integer page
    ) {
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new CustomException(GlobalErrorCode.INVALID_INPUT_VALUE);
        }
        return ResponseEntity.ok(planService.getPopularPlans(lat, lng, limit, page));
    }

    @Operation(summary = "전국 인기 플랜 조회", description = "전국 기준 인기 플랜 목록을 페이지 단위로 조회합니다.")
    @ApiResponse(responseCode = "200", description = "전국 인기 플랜 목록을 성공적으로 조회했습니다.")
    @GetMapping("/popular/nationwide")
    public ResponseEntity<PopularPlanResponseDto> getNationwidePopularPlans(
            @Parameter(description = "페이지당 조회 개수", example = "3") @RequestParam(defaultValue = "3") Integer limit,
            @Parameter(description = "페이지 번호", example = "1") @RequestParam(defaultValue = "1") Integer page
    ) {
        return ResponseEntity.ok(planService.getNationwidePopularPlans(limit, page));
    }

    @PostMapping("/create")
    @Operation(summary = "플랜 생성", description = "장소 목록을 포함한 새로운 플랜을 생성합니다.")
    @ApiResponse(responseCode = "201", description = "플랜이 성공적으로 생성되었습니다.")
    public ResponseEntity<CreatePlanResponseDto> createPlan(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @RequestBody CreatePlanRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planService.CreatePlanWithPlaces(user.getUserId(), request));
    }


    @PatchMapping("/{planId}")
    @Operation(summary = "플랜 수정", description = "플랜의 기본 정보 및 수정 가능한 여행 정보를 변경합니다.")
    @ApiResponse(responseCode = "200", description = "플랜이 성공적으로 수정되었습니다.")
    public ResponseEntity<UpdatePlanResponseDto> updatePlan(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "수정할 플랜 ID", example = "1") @PathVariable Integer planId,
            @RequestBody UpdatePlanRequestDto request
    ) {
        return ResponseEntity.ok(planService.updatePlan(user.getUserId(), planId, request));
    }


    @DeleteMapping("/{planId}")
    @Operation(summary = "플랜 삭제", description = "현재 로그인한 사용자가 작성한 플랜을 삭제합니다.")
    @ApiResponse(responseCode = "204", description = "플랜이 성공적으로 삭제되었습니다.")
    public ResponseEntity<Void> deletePlan(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "삭제할 플랜 ID", example = "1") @PathVariable Integer planId
    ) {
        planService.deletePlan(user.getUserId(), planId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }


    @PostMapping("/{planId}/images")
    @Operation(summary = "플랜 이미지 업로드", description = "특정 플랜에 이미지를 업로드합니다.")
    @ApiResponse(responseCode = "200", description = "플랜 이미지가 성공적으로 업로드되었습니다.")
    public ResponseEntity<PlanDetailDto> planImagesUpload(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "플랜 ID", example = "1") @PathVariable Integer planId,
            @Parameter(description = "업로드할 이미지 목록") @RequestParam List<MultipartFile> images
    ) {
        return ResponseEntity.ok(planService.uploadImages(user.getUserId(), planId, images));
    }

    @DeleteMapping("/{planId}/images")
    @Operation(summary = "플랜 이미지 삭제", description = "특정 플랜에 등록된 이미지들을 삭제합니다.")
    @ApiResponse(responseCode = "200", description = "플랜 이미지가 성공적으로 삭제되었습니다.")
    public ResponseEntity<PlanDetailDto> deleteImages(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "플랜 ID", example = "1") @PathVariable Integer planId,
            @Parameter(description = "삭제할 이미지 ID 목록", example = "1") @RequestParam List<Integer> imageIds
    ) {
        return ResponseEntity.ok(planService.deleteImages(user.getUserId(), planId, imageIds));
    }


}