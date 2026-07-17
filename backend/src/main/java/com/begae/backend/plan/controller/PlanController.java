package com.begae.backend.plan.controller;

import com.begae.backend.plan.dto.*;
import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.GlobalErrorCode;
import com.begae.backend.plan.dto.PlanCopyResponseDto;
import com.begae.backend.plan.dto.PlanDetailDto;
import com.begae.backend.plan.dto.PopularPlanResponseDto;
import com.begae.backend.plan.service.PlanService;
import com.begae.backend.global.security.principal.OauthUserDetails;
import io.swagger.v3.oas.annotations.Operation;
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

@Tag(name = "플랜", description = "플랜 생성, 조회, 수정, 삭제, 복사, 이미지 및 인기 플랜 관련 API")
@Validated
@RestController
@RequestMapping("api/plan")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @GetMapping
    public ResponseEntity<Void> getPlanByLikeCount() {
        return null;
    }

//    @PostMapping("/preview")
//    public ResponseEntity<PlanPreviewResponse> postPlanPreview(@RequestBody PlanPreviewRequest planPreviewRequest) {
//        return ResponseEntity.status(HttpStatus.OK).body(planService.createPlanPreview(planPreviewRequest));
//    }
//
    @GetMapping("/{planId}")
    public ResponseEntity<PlanDetailDto> getPlanDetail(
            @AuthenticationPrincipal OauthUserDetails userDetails,
            @PathVariable Integer planId
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(planService.getPlanDetail(planId, userDetails.getUserId()));
    }

    @PostMapping("{planId}/clone")
    public ResponseEntity<PlanCopyResponseDto> copyPlan(
            @PathVariable @Positive Integer planId,
            @Valid @RequestBody PlanCopyRequestDto planCopyRequestDto,
            @AuthenticationPrincipal OauthUserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(planService.copyPlan(planId, planCopyRequestDto, userDetails.getUserId()));
    }

    /**
     * 내 주변 인기 플랜 조회
     * @param lat
     * @param lng
     * @param limit
     * @param page
     * @return
     */
    @GetMapping("/popular")
    public ResponseEntity<PopularPlanResponseDto> getPopularPlans(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "5") Integer limit,
            @RequestParam(defaultValue = "1") Integer page
    ) {
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new CustomException(GlobalErrorCode.INVALID_INPUT_VALUE);
        }
        return ResponseEntity.ok(planService.getPopularPlans(lat, lng, limit, page));
    }

    /**
     * 전국 인기 플랜 조회
     * @param limit
     * @param page
     * @return
     */
    @GetMapping("/popular/nationwide")
    public ResponseEntity<PopularPlanResponseDto> getNationwidePopularPlans(
            @RequestParam(defaultValue = "3") Integer limit,
            @RequestParam(defaultValue = "1") Integer page
    ) {
        return ResponseEntity.ok(planService.getNationwidePopularPlans(limit, page));
    }

    @PostMapping("/create")
    @Operation(summary = "플랜 생성", description = "장소 목록을 포함한 새로운 플랜을 생성합니다.")
    @ApiResponse(responseCode = "201", description = "플랜이 성공적으로 생성되었습니다.")
    public ResponseEntity<CreatePlanResponseDto> createPlan(@AuthenticationPrincipal OauthUserDetails user,
                                                            @RequestBody CreatePlanRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planService.CreatePlanWithPlaces(user.getUserId(), request));
    }

    @PatchMapping("/{planId}")
    @Operation(summary = "플랜 수정", description = "플랜의 기본 정보 및 수정 가능한 여행 정보를 변경합니다.")
    @ApiResponse(responseCode = "200", description = "플랜이 성공적으로 수정되었습니다.")
    public ResponseEntity<UpdatePlanResponseDto> updatePlan(@AuthenticationPrincipal OauthUserDetails user,
                                           @PathVariable Integer planId,
                                           @RequestBody UpdatePlanRequestDto request) {
        // 이름, 사진, 공개여부, 설명은 변경가능
        // 나머지(출발지, 여행시작/여행종료일자)는 인증 여부 검사
        return ResponseEntity.ok(planService.updatePlan(user.getUserId(), planId, request));
    }

    @DeleteMapping("/{planId}")
    @Operation(summary = "플랜 삭제", description = "현재 로그인한 사용자가 작성한 플랜을 삭제합니다.")
    @ApiResponse(responseCode = "204", description = "플랜이 성공적으로 삭제되었습니다.")
    public ResponseEntity<Void> deletePlan(@AuthenticationPrincipal OauthUserDetails user,
                                           @PathVariable Integer planId) {
        planService.deletePlan(user.getUserId(), planId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/{planId}/images")
    @Operation(summary = "플랜 이미지 업로드", description = "특정 플랜에 이미지를 업로드합니다.")
    @ApiResponse(responseCode = "200", description = "플랜 이미지가 성공적으로 업로드되었습니다.")
    public ResponseEntity<PlanDetailDto> planImagesUpload(@AuthenticationPrincipal OauthUserDetails user,
                                                         @PathVariable Integer planId,
                                                         @RequestParam List<MultipartFile> images) {
        return ResponseEntity.ok(planService.uploadImages(user.getUserId(), planId, images));
    }

    @DeleteMapping("/{planId}/images")
    @Operation(summary = "플랜 이미지 삭제", description = "특정 플랜에 등록된 이미지들을 삭제합니다.")
    @ApiResponse(responseCode = "200", description = "플랜 이미지가 성공적으로 삭제되었습니다.")
    public ResponseEntity<PlanDetailDto> deleteImages(@AuthenticationPrincipal OauthUserDetails user,
                                                      @PathVariable Integer planId,
                                                      @RequestParam List<Integer> imageIds) {
        return ResponseEntity.ok(planService.deleteImages(user.getUserId(), planId, imageIds));
    }

}