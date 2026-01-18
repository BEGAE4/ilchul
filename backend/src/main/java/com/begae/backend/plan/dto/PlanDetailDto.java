package com.begae.backend.plan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanDetailDto {
    private Integer planId;
    private String planTitle;
    private LocalDateTime tripDate;
    private LocalDateTime createAt;
    private Boolean isPlanVisible;
    private String planDescription;
    private List<PlanPlaceDetailDto> planPlaceDetailDtos;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlanPlaceDetailDto {
        private Integer planPlaceId;
        private String placeImage;
        private String placeName;
        private String address;
        private Integer orderIndex;
        private Boolean isStamped;
        private Integer travelTime;
    }
}
