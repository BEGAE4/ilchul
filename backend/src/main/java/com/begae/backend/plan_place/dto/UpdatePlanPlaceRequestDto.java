package com.begae.backend.plan_place.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class UpdatePlanPlaceRequestDto {

    private Integer requiredTime;

    private Integer totalDistance;

    private String departurePoint;

    private List<PlanPlaceRequest> places;

    @Data
    @NoArgsConstructor
    public static class PlanPlaceRequest {
        private Integer placeId;
        private Integer order;
        private Integer travelTime;
        private Integer stayTime;
    }
}
