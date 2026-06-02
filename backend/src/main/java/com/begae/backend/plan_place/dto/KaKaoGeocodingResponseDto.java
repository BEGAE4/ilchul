package com.begae.backend.plan_place.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class KaKaoGeocodingResponseDto {

    private List<Document> documents;

    @Data
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Document {
        private String addressName;
        private String addressType;
        private String x;
        private String y;
    }
}
