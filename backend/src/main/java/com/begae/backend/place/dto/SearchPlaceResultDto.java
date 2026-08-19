package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SearchPlaceResultDto {

    private final Integer placeId;

    private final String placeName;

    private final String addressName;

    private final String roadAddressName;

    private final String categoryName;

    private final String placeImageUrl;

    private final Double x;

    private final Double y;

    private final Integer likeCount;

    private final Integer scrapCount;

    private final Integer includedPlanCount;
}
