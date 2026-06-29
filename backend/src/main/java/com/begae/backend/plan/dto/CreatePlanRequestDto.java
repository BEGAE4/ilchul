package com.begae.backend.plan.dto;

import com.begae.backend.plan.domain.DeparturePoint;
import com.fasterxml.jackson.annotation.JsonFormat;
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

    private DeparturePointDto departurePoint;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime tripStartDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime tripEndDate;

    private List<CreatePlanPlaceRequest> places;

    @Data
    @NoArgsConstructor
    public static class CreatePlanPlaceRequest {
        private Integer placeId;
        private Integer order;
        private Integer travelTime;
        private Integer stayTime;
    }


}
