package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SurveyResultDto {
    String emotion;
    String startTime;
    String endTime;
    String transport;
    Location location;

    @Data
    @Builder
    public static class Location {
        double x;
        double y;
    }
}
