package com.begae.backend.plan_place.controller;

import com.begae.backend.global.security.principal.OauthUserDetails;
import com.begae.backend.plan_place.dto.*;
import com.begae.backend.plan_place.service.PlanPlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/plan-place")
@RequiredArgsConstructor
public class PlanPlaceController {

    private final PlanPlaceService planPlaceService;

    @PostMapping("/preview")
    public ResponseEntity<CreatePlanPreviewResponseDto> getCreatePlanPreview(@AuthenticationPrincipal OauthUserDetails user,
                                                                             @RequestBody CreatePlanPreviewRequestDto request) {
        return ResponseEntity.ok().body(planPlaceService.createPlanPreview(request));
    }

    @PostMapping("/{planId}/preview")
    public ResponseEntity<UpdatePlanPreviewResponseDto> getUpdatePlanPreview(@AuthenticationPrincipal OauthUserDetails user,
                                                                             @PathVariable Integer planId,
                                                                             @RequestBody UpdatePlanPlaceRequestDto request) {
        return ResponseEntity.ok().body(planPlaceService.updatePlanPreview(user.getUserId(), planId, request));
    }

    @PostMapping("/{planId}/update")
    public ResponseEntity<UpdatePlanPlaceResponseDto> updatePlanPlace(@AuthenticationPrincipal OauthUserDetails user,
                                                                      @PathVariable Integer planId,
                                                                      @RequestBody UpdatePlanPlaceRequestDto request) {
        return ResponseEntity.ok().body(planPlaceService.updatePlanPlace(user.getUserId(), planId, request));
    }

    @PostMapping(
            value = "/{planPlaceId}/stamp",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<StampPlanPlaceResponseDto> stampPlanPlace(@AuthenticationPrincipal OauthUserDetails user,
                                                @PathVariable Integer planPlaceId,
                                               @ModelAttribute StampPlanPlaceRequestDto request
    ) {
        ;
        return ResponseEntity.ok().body(planPlaceService.stampPlanPlace(user.getUserId(), planPlaceId, request));
    }
}
