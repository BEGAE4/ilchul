package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SearchPlaceResponseDto {

    private int placeId;

    private String placeImageUrl;

    private String categoryName;

    private String placeName;

}
