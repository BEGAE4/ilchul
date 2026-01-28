package com.begae.backend.plan_place.dto;

import lombok.Data;

import java.util.List;

@Data
public class CalculateDurationRequestDto {

    private String planTitle;

    private String planDescription;

    private Boolean isPlanVisible;

    private List<Place> places;

    @Data
    public static class Place {
        private int placeId;

        private int order;
    }

}
