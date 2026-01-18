package com.begae.backend.plan_place.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class KakaoNaviResponseDto {

    @JsonProperty("trans_id")
    private String transId;

    private List<Route> routes;

    @Data
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Route {
        private int resultCode;
        private String resultMsg;
        private Summary summary;
        private List<Section> sections;
    }

    @Data
    public static class Summary {
        private Point origin;
        private Point destination;
        private List<Point> waypoints;
        private String priority;

        private Bound bound;
        private Fare fare;

        private int distance;
        private int duration;
    }


    @Data
    public static class Section {
        private int distance;
        private int duration;
    }


    @Data
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Bound {
        private double minX;
        private double minY;
        private double maxX;
        private double maxY;
    }

    @Data
    public static class Fare {
        private int taxi;
        private int toll;
    }

}
