package com.begae.backend.plan.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class PlanDetailFlatDto {
    private Integer planId;
    private String planTitle;
    private LocalDateTime tripStartDate;
    private LocalDateTime tripEndDate;
    private LocalDateTime createAt;
    private Boolean isVerified;
    private Boolean isPlanVisible;
    private String planDescription;
    private int requiredTime;
//    private int totalBudget;
    private int totalDistance;
    private Integer likeCount;
    private Integer scrapCount;
    private Integer planPlaceId;
    private Integer travelTime;
    private Integer stayTime;
    private String placeImage;
    private String placeName;
    private String addressName;
    private String roadAddressName;
    private String categoryName;
    private Integer orderIndex;
    private Boolean isStamped;
}
