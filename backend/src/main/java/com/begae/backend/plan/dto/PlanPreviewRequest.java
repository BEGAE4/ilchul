package com.begae.backend.plan.dto;

import com.begae.backend.plan.enums.TransportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanPreviewRequest {
    private String planTitle;
    private String planDescription;
    private String departurePoint;      // 출발지
    private String tripDate;            // 여행 날짜
    private TransportType transportType; // 이동수단
    private List<SelectedPlace> selectedPlaces;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SelectedPlace {
        private String sourceId;
        private String placeName;
        private String addressName;
        private String roadAddressName;
        private String categoryName;
        private String phone;
        private String placeUrl;
        private String longitude;
        private String latitude;
        private Integer orderIndex;
    }
}
