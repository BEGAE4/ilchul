package com.begae.backend.plan.dto;

import com.begae.backend.plan.enums.TransportType;
import lombok.*;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanPreviewResponse {
    private String planTitle;
    private String planDescription;
    private String tripDate;
    private TransportType transportType;
    private Summary summary;
    private List<PlaceWithRoute> places;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Integer totalTravelMinutes;     // 총 이동시간
        private Double totalDistanceKm;         // 총 이동거리
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlaceWithRoute {
        private String sourceId;
        private String placeName;
        private String addressName;
        private String latitude;
        private String longitude;
        private Integer orderIndex;

        // 다음 장소로 가는 경로 정보
        private RouteInfo routeToNext;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteInfo {
        private String fromPlaceName;
        private String toPlaceName;
        private Integer durationMinutes;       // 이동 소요시간
        private Double distanceKm;             // 이동 거리
        private TransportType transportType;
    }
}
