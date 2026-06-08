package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
public class PlaceDetailResponseDto {
    private Integer placeId;

    private String placeName;

    private String addressName;

    private String roadAddressName;

    private String categoryName;

    private String phone;

    private String placeUrl;

    private String placeImageUrl;

    private Double x;

    private Double y;
}
