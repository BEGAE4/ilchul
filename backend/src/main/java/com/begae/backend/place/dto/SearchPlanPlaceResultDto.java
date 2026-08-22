package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SearchPlanPlaceResultDto {

    private final Integer planPlaceId;

    private final Integer placeId;

    private final String placeName;

    private final String categoryName;

    private final String addressName;

    private final String roadAddressName;

    private final String placeImageUrl;

    private final Integer orderIndex;

    private final Boolean matched;
}
