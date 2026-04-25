package com.begae.backend.plan_place.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CreatePlanPreviewResponseDto {

    private String planTitle;

    private String planDescription;

    private Boolean isPlanVisible;

    private int totalDuration;

    private List<Place> places;

    @Data
    @Builder
    public static class Place {
        private int placeId;
        private String placeName;
        private String roadAddressName;
        private int duration;
        private int order;
    }

}
