package com.begae.backend.plan.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class CreatePlanRequestDto {

    private String planTitle;

    private Boolean isPlanVisible;

    private String planDescription;

    private Integer requiredTime;

    private Integer totalDistance;

    private String departurePoint;

    private LocalDateTime tripStartDate;

    private LocalDateTime tripEndDate;

    private List<CreatePlanPlaceRequest> places;

    @Data
    @NoArgsConstructor
    public static class CreatePlanPlaceRequest {
        private Integer placeId;
        private Integer order;
        private Integer traveltime;
        private Integer stayTime;
    }


}
