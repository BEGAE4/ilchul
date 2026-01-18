package com.begae.backend.plan.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class PlanDetailFlatDto {
    private Integer planId;
    private String planTitle;
    private LocalDateTime tripDate;
    private LocalDateTime createAt;
    private Boolean isPlanVisible;
    private String planDescription;
    private Integer travelTime;
    private Integer planPlaceId;
    private String placeImage;
    private String placeName;
    private String address;
    private Integer orderIndex;
    private Boolean isStamped;
}
