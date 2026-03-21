package com.begae.backend.plan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanDetailDto {
    private Integer planId;
    private String planTitle;
    private LocalDateTime tripStartDate;
    private LocalDateTime tripEndDate;
    private LocalDateTime createAt;
    private Boolean isVerified;
    private Boolean isPlanVisible;
    private int requiredTime;
    private int totalBudget;
    private int totalDistance;
    private String planDescription;
    private Integer likeCount;
    private Integer scrapCount;
    private List<PlanPlaceDetailDto> planPlaceDetailDtos;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlanPlaceDetailDto {
        private Integer planPlaceId;
        private String placeImage;
        private String placeName;
        private String addressName;
        private String roadAddressName;
        private String categoryName;
        private Integer orderIndex;
        private Boolean isStamped;
        private Integer travelTime;
        private Integer stayTime;
    }
}
