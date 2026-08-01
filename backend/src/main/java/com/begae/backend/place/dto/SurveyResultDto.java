package com.begae.backend.place.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyResultDto {

    private String emotion;

    private String startTime;

    private String endTime;

    private String transport;

    private Integer transportTime;

    private Location location;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {

        private double x;

        private double y;
    }
}