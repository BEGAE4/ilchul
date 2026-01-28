package com.begae.backend.place.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class RecommendKeywordDto {

    private Input input;

    private List<Recommendation> recommendations;

    private Constraints constraints;

    @Data
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Input {
        String emotion;
        String timeOfDay;
        String durationMinutes;
    }

    @Data
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Recommendation {
        String keyword;
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
