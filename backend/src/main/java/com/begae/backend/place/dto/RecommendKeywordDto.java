package com.begae.backend.place.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * LLM이 추천한 카카오 로컬 API 검색용 키워드 응답 DTO.
 *
 * LLM은 키워드만 추천하고,
 * 검색 반경, 방문 가능 장소 수, 거리 계산은 서버에서 처리한다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendKeywordDto {

    private Input input;

    private List<Recommendation> recommendations;

    private Constraints constraints;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Input {

        private String emotion;

        @JsonProperty("start_time")
        private String startTime;

        @JsonProperty("end_time")
        private String endTime;

        private String transport;

        @JsonProperty("transport_time_minutes")
        private Integer transportTimeMinutes;

        private Location location;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {

        private Double x;

        private Double y;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Recommendation {

        private Integer order;

        /**
         * 카카오 로컬 API 키워드 검색에 그대로 사용할 검색어.
         */
        private String keyword;

        private String why;

        @JsonProperty("best_for")
        private List<String> bestFor;

        @JsonProperty("avoid_if")
        private List<String> avoidIf;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Constraints {

        private List<String> notes;
    }
}