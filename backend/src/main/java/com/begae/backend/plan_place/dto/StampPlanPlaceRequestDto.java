package com.begae.backend.plan_place.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
public class StampPlanPlaceRequestDto {
    private MultipartFile image;
    private Location location;

    @Data
    @NoArgsConstructor
    public static class Location {
        private Double x;
        private Double y;
    }
}
