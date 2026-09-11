package com.begae.backend.place.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class AiSelectionDto {

    @JsonAlias("travel_plan")
    private TravelPlan travelPlan;

    private List<Selection> selections;

    @Data
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class TravelPlan {
        private int totalHours;
        private int estimatedPlaceCount;
        private String reasoning;
    }

    @Data
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Selection {
        /** 후보 리스트에서의 0-based 위치. 모델이 범위 밖을 반환할 수 있어 검증 대상이다. */
        private int index;
        private int order;
        private int stayMinutes;
        private String reason;
        private List<String> tags;
    }
}
