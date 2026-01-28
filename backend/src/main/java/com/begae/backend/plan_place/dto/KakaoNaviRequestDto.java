package com.begae.backend.plan_place.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class KakaoNaviRequestDto {

    private Point origin;

    private Point destination;

    private List<Point> waypoints;

    private String priority;

    private boolean summary;

}
