package com.begae.backend.plan_place.dto;

import lombok.Data;

import java.util.List;

@Data
public class CalculateDurationRequestDto {

    private List<Place> places;

    public static class Place {
        public int placeId;

        public int order;
    }

}
