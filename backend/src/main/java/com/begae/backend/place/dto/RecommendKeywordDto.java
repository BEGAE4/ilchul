package com.begae.backend.place.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class RecommendKeywordDto {

    private Input input;

    @JsonAlias("travel_plan")
    private TravelPlan travelPlan;

    private List<Recommendation> recommendations;

    private Constraints constraints;

    @Data
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Input {
        String emotion;
        String startTime;
        String endTime;
        String transport;
        Location location;

        @Data
        @NoArgsConstructor
        public static class Location {
            String x;
            String y;
        }
    }

    @Data
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class TravelPlan {
        int totalHours;
        int estimatedPlaceCount;
        String reasoning;
    }

    @Data
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Recommendation {
        int order;
        String keyword;
        int radiusM;
        String why;
        List<String> bestFor;
        List<String> avoidIf;
    }

    @Data
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Constraints {
        List<String> notes;
    }
}
