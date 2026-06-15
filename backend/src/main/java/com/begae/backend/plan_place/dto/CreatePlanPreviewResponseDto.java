package com.begae.backend.plan_place.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CreatePlanPreviewResponseDto {

    private String planTitle;

    private String planDescription;

    private Boolean isPlanVisible;

    private Integer requiredTime;

    private Integer totalDistance;

    private String departurePoint;

    private LocalDateTime tripStartDate;

    private LocalDateTime tripEndDate;

    private List<PlanPlacePreview> places;

    @Data
    @Builder
    public static class PlanPlacePreview {
        private Integer placeId;
        private String placeName;
        private String addressName;
        private String roadAddressName;
        private String categoryName;
        private Integer duration;
        private Integer order;
        private Double x;
        private Double y;
    }

}
