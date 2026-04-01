package com.begae.backend.plan_place.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CreatePlanPreviewResponseDto {

    private String draftId; // redis 캐싱 draft 조회에 필요한 id

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
        private String placeImageUrl;
        private int duration;
        private int order;
    }

}
