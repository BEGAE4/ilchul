package com.begae.backend.plan_place.controller;

import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.plan_place.dto.*;
import com.begae.backend.plan_place.service.PlanPlaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "플랜 장소", description = "플랜 장소 미리보기, 수정 및 인증 스탬프 관련 API")
@RestController
@RequestMapping("api/plan-place")
@RequiredArgsConstructor
public class PlanPlaceController {

    private final PlanPlaceService planPlaceService;

    @PostMapping("/preview")
    @Operation(summary = "플랜 생성 전 미리보기", description = "플랜 생성 전 선택한 장소들을 기반으로 경로 및 소요 정보를 미리 계산합니다.")
    @ApiResponse(responseCode = "200", description = "플랜 생성 미리보기가 성공적으로 조회되었습니다.")
    public ResponseEntity<CreatePlanPreviewResponseDto> getCreatePlanPreview(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @RequestBody CreatePlanPreviewRequestDto request
    ) {
        return ResponseEntity.ok().body(planPlaceService.createPlanPreview(request));
    }


    @PostMapping("/{planId}/preview")
    @ApiResponse(responseCode = "200", description = "플랜 수정 미리보기가 성공적으로 조회되었습니다.")
    public ResponseEntity<UpdatePlanPreviewResponseDto> getUpdatePlanPreview(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "플랜 ID", example = "1") @PathVariable Integer planId,
            @RequestBody UpdatePlanPlaceRequestDto request
    ) {
        return ResponseEntity.ok().body(planPlaceService.updatePlanPreview(user.getUserId(), planId, request));
    }


    @PostMapping("/{planId}/update")
    @Operation(summary = "플랜 장소 수정", description = "기존 플랜에 포함된 장소 목록 및 순서 정보를 수정합니다.")
    @ApiResponse(responseCode = "200", description = "플랜 장소 정보가 성공적으로 수정되었습니다.")
    public ResponseEntity<UpdatePlanPlaceResponseDto> updatePlanPlace(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "플랜 ID", example = "1") @PathVariable Integer planId,
            @RequestBody UpdatePlanPlaceRequestDto request
    ) {
        return ResponseEntity.ok().body(planPlaceService.updatePlanPlace(user.getUserId(), planId, request));
    }


    @PostMapping(
            value = "/{planPlaceId}/stamp",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(summary = "플랜 장소 인증 스탬프 등록", description = "특정 플랜 장소에 방문 인증 스탬프와 이미지를 등록합니다.")
    @ApiResponse(responseCode = "200", description = "플랜 장소 인증 스탬프가 성공적으로 등록되었습니다.")
    public ResponseEntity<StampPlanPlaceResponseDto> stampPlanPlace(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @Parameter(description = "플랜 장소 ID", example = "1") @PathVariable Integer planPlaceId,
            @ModelAttribute StampPlanPlaceRequestDto request
    ) {
        return ResponseEntity.ok().body(planPlaceService.stampPlanPlace(user.getUserId(), planPlaceId, request));
    }

}
