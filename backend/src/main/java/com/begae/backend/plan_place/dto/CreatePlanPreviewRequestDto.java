package com.begae.backend.plan_place.dto;

import com.begae.backend.plan.dto.DeparturePointDto;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreatePlanPreviewRequestDto {

    private String planTitle;

    private String planDescription;

    private Boolean isPlanVisible;

    private DeparturePointDto departurePoint;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime tripStartDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime tripEndDate;

    private List<Place> places;

    @Data
    public static class Place {
        private Integer placeId;

        private Integer order;
    }

}
