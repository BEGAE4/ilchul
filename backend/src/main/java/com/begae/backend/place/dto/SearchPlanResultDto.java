package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class SearchPlanResultDto {

    private final Integer planId;

    private final String planTitle;

    private final String planDescription;

    private final Integer requiredTime;

    private final Integer totalDistance;

    private final Integer likeCount;

    private final Integer scrapCount;

    private final LocalDateTime createAt;

    private final String thumbnailUrl;

    private final Boolean matchedByPlace;

    private final List<SearchPlanPlaceResultDto> places;
}
