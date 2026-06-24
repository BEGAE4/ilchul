package com.begae.backend.plan_place.dto;

import com.begae.backend.plan.dto.DeparturePointDto;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UpdatePlanPreviewResponseDto {

    private Integer planId;

    private String planTitle;

    private String planDescription;

    private Boolean isPlanVisible;

    private Integer requiredTime;

    private Integer totalDistance;

    private DeparturePointDto departurePoint;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime tripStartDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
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
        private Integer stayTime;
        private Boolean isStamped;
        private Double x;
        private Double y;
    }

}
