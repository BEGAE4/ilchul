package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GooglePlaceResponseDto {

    private List<Place> places;


    @Data
    public static class Place {
        private String formattedAddress;
        private DisplayName displayName;
        private List<Photo> photos;
    }

    @Data
    public static class DisplayName {
        private String text;
    }

    @Data
    public static class Photo {
        private String name;
    }
}
