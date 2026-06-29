package com.begae.backend.plan_place.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class StampPlanPlaceResponseDto {
    private Integer planPlaceId;
    private Boolean isStamped;
    private String verifiedImage;
    private LocalDateTime stampedAt;
}
